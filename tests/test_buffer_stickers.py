import contextlib
import io
import random
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from flask import template_rendered

from app import app, BUFFER_STICKERS, parse_buffer
from Cube import (Cube, SPEFFZ, EDGE_TARGET_NAMES, CORNER_TARGET_NAMES,
                  UF, UB, UR, UL, FR, FL, UFR, UFL, UBR, UBL, DFR, DFL)
from beginner_solutions import op_edge_examples, op_corner_examples


class BufferStickerTests(unittest.TestCase):
    def test_traces_solve_by_swapping_selected_stickers_including_floating(self):
        rng = random.Random(42)
        for kind, count, modulus in (("edge", 12, 2), ("corner", 8, 3)):
            for trial in range(100):
                with self.subTest(kind=kind, trial=trial):
                    cube = Cube()
                    cube.apply_scramble(" ".join(
                        rng.choice("URFDLB") + rng.choice(("", "'", "2")) for _ in range(25)))
                    buffer = trial % count
                    choices = {p: rng.randrange(modulus) for p in range(count)}
                    choices[buffer] = trial % modulus
                    order = list(range(count))
                    rng.shuffle(order)
                    original = cube.get_state()
                    trace, _, _, switches = getattr(cube, f"trace_{kind}s")(
                        buffer=buffer, buffer_orientations=choices,
                        floating_buffers=order if trial % 2 else [],
                        auto_standalone=True, return_cycles=True,
                        return_cycle_breaks=True, return_floating=True)
                    self.assertEqual(cube.get_state(), original)
                    changes = {s["after_target"]: s["to_buffer"] for s in switches if "to_buffer" in s}
                    perm, ori = getattr(cube, f"{kind}_perm"), getattr(cube, f"{kind}_ori")
                    # Execute sticker swaps independently of the tracing code.
                    for index, (position, orientation) in enumerate(trace):
                        buffer = changes.get(index, buffer)
                        offset = choices[buffer]
                        perm[buffer], perm[position] = perm[position], perm[buffer]
                        ori[buffer], ori[position] = (
                            (ori[position] + offset - orientation) % modulus,
                            (ori[buffer] + orientation - offset) % modulus)
                    self.assertEqual(perm, list(range(count)))
                    self.assertEqual(ori, [0] * count)

    def test_all_stickers_and_legacy_piece_ids_parse(self):
        for kind, groups in BUFFER_STICKERS.items():
            for position, (piece, stickers) in enumerate(groups.items()):
                self.assertEqual(parse_buffer(str(position), kind), (position, piece))
                for sticker in stickers:
                    self.assertEqual(parse_buffer(sticker, kind), (position, sticker))

    def test_invalid_orientation_maps_are_rejected(self):
        for kind, invalid in (("edge", {0: 2}), ("corner", {0: 3}),
                              ("edge", {12: 0}), ("corner", {-1: 0})):
            with self.subTest(kind=kind, invalid=invalid), self.assertRaises(ValueError):
                getattr(Cube(), f"trace_{kind}s")(buffer_orientations=invalid)

    def test_op_examples_execute_swaps_relative_to_buffer_sticker(self):
        for names, buffer_piece, modulus, examples in (
            (EDGE_TARGET_NAMES, UR, 2, op_edge_examples),
            (CORNER_TARGET_NAMES, UBL, 3, op_corner_examples),
        ):
            for offset in range(modulus):
                buffer = names[(buffer_piece, offset)]
                targets = [name for (p, o), name in names.items() if p != buffer_piece]
                rows = examples(targets, SPEFFZ, buffer)
                coordinates = {name: pair for pair, name in names.items()}
                for row in rows:
                    with self.subTest(buffer=buffer, target=row["positions"][1]):
                        self.assertEqual(row["positions"][0], buffer)
                        position, orientation = coordinates[row["positions"][1]]
                        cube = Cube()
                        cube.apply_scramble(row["algorithm"].replace("2'", "2"))
                        kind = "edge" if modulus == 2 else "corner"
                        perm, ori = getattr(cube, f"{kind}_perm"), getattr(cube, f"{kind}_ori")
                        self.assertEqual(perm[buffer_piece], position)
                        self.assertEqual(perm[position], buffer_piece)
                        self.assertEqual(ori[position], (orientation - offset) % modulus)
                        self.assertEqual(ori[buffer_piece], (offset - orientation) % modulus)


class BufferStickerFormTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        old = app.config["BULK_DATABASE"]
        self.addCleanup(app.config.__setitem__, "BULK_DATABASE", old)
        app.config["BULK_DATABASE"] = str(Path(self.directory.name) / "bulk.sqlite3")

    def post(self, route, data):
        contexts = []
        def capture(sender, template, context, **extra):
            contexts.append(context)
        with template_rendered.connected_to(capture, app), contextlib.redirect_stdout(io.StringIO()):
            response = app.test_client().post(route, data=data)
        self.assertEqual(response.status_code, 200)
        return contexts[0], response.get_data(as_text=True)

    def test_every_sticker_is_accepted_on_both_pages(self):
        for route in ("/beginner", "/expert"):
            for kind, groups in BUFFER_STICKERS.items():
                for stickers in groups.values():
                    for sticker in stickers:
                        with self.subTest(route=route, sticker=sticker):
                            context, html = self.post(route, {"scramble": "R U F", f"{kind}_buffer": sticker})
                            self.assertIsNone(context["error"])
                            self.assertEqual(context[f"{kind}_buffer_sticker"], sticker)
                            self.assertIn(f'data-sticker="{sticker}"', html)

    def test_lub_memo_and_examples_use_selected_sticker_and_custom_letters(self):
        context, _ = self.post("/beginner", {"scramble": "U", "corner_buffer": "LUB", "letter_BUR": "中"})
        self.assertEqual(context["corner_target_names"], ["FUL", "RUF", "BUR"])
        self.assertEqual(context["corner_buffer_names_used"], ["LUB"])
        self.assertIn("中", context["corner_memo"])
        self.assertTrue(context["beginner_corner_op_supported"])
        self.assertTrue(all(row["positions"][0] == "LUB"
                            for row in context["beginner_corner_solution_examples"]))

    def test_floating_and_bulk_preserve_stickers_and_usage(self):
        settings = {"scramble": "R U F", "edge_buffer": "FU", "corner_buffer": "LUB",
                    "edge_floating_buffers": ["UF", "UB", "UR", "UL", "FR", "FL", "DF", "DB", "DR", "DL", "BR", "BL"],
                    "corner_floating_buffers": ["UFR", "UFL", "UBR", "UBL", "DFR", "DFL", "DBR", "DBL"],
                    "edge_buffer_sticker_UB": "BU", "corner_buffer_sticker_DFR": "FDR"}
        single, _ = self.post("/expert", settings)
        bulk, _ = self.post("/expert", dict(settings, action="bulk", bulk_scrambles="R U F"))
        self.assertIsNone(single["error"])
        self.assertIsNone(bulk["error"])
        row = bulk["bulk_results"][0]
        for key in ("edge_memo", "corner_memo", "solution_cases", "edge_buffer_names_used", "corner_buffer_names_used"):
            self.assertEqual(single[key], row[key])
        self.assertEqual(single["solution_cases"][0]["positions"][0], "FU")
        for kind in ("edge", "corner"):
            used = {item["name"] for item in bulk["bulk_stats"][f"{kind}_buffer_usage"] if item["count"]}
            self.assertEqual(used, set(row[f"{kind}_buffer_names_used"]))

    def test_floating_labels_targets_and_examples_use_noncanonical_stickers(self):
        def setup(cube, scramble):
            cube.edge_perm[UF], cube.edge_perm[UB], cube.edge_perm[UR] = UB, UR, UF
            cube.edge_perm[UL], cube.edge_perm[FR], cube.edge_perm[FL] = FR, FL, UL
            cube.corner_perm[UFR], cube.corner_perm[UFL], cube.corner_perm[UBR] = UFL, UBR, UFR
            cube.corner_perm[UBL], cube.corner_perm[DFR], cube.corner_perm[DFL] = DFR, DFL, UBL
        with patch("app.Cube.apply_scramble", setup):
            context, html = self.post("/expert", {
                "edge_buffer": "FU", "corner_buffer": "RUF",
                "edge_floating_buffers": "UL", "edge_buffer_sticker_UL": "LU",
                "corner_floating_buffers": "UBL", "corner_buffer_sticker_UBL": "LUB",
                "letter_LU": "中", "letter_LUB": "角"})
        self.assertIsNone(context["error"])
        self.assertEqual(context["edge_target_names"], ["BU", "RU", "RF", "LF"])
        self.assertEqual(context["corner_target_names"], ["FUL", "BUR", "FDR", "LDF"])
        self.assertIn("[Buffer 中]", context["edge_memo"])
        self.assertIn("[Buffer 角]", context["corner_memo"])
        self.assertEqual(context["solution_cases"][1]["positions"], ["LU", "RF", "LF"])
        self.assertEqual(context["edge_buffer_names_used"], ["FU", "LU"])
        self.assertEqual(context["corner_buffer_names_used"], ["RUF", "LUB"])
        self.assertIn("LUB → UFR", html)

    def test_invalid_buffers_return_form_errors(self):
        for data in ({"edge_buffer": "-1"}, {"corner_buffer": "8"}, {"corner_buffer": "ULB"},
                     {"edge_buffer_sticker_UF": "BU"}, {"corner_buffer_sticker_UBL": "UFR"}):
            context, _ = self.post("/expert", dict(data, scramble="R U"))
            self.assertIn("buffer sticker", context["error"])

    def test_rotated_scrambles_memo_from_final_orientation(self):
        for route in ("/beginner", "/expert"):
            for settings in ({}, {"edge_buffer": "RU", "corner_buffer": "LUB",
                                  "letter_BUR": "中", "use_pseudoswap": "on"}):
                for rotated, equivalent in (("U x", "B"), ("U x y", "R"), ("R y", "F")):
                    with self.subTest(route=route, settings=settings, rotated=rotated):
                        actual, _ = self.post(route, dict(settings, scramble=rotated))
                        expected, _ = self.post(route, dict(settings, scramble=equivalent))
                        bulk, _ = self.post(route, dict(
                            settings, action="bulk", bulk_scrambles=f"{rotated}\n{equivalent}"))
                        self.assertIsNone(actual["error"])
                        self.assertIsNone(bulk["error"])
                        for key in ("edge_memo", "corner_memo", "edge_target_names",
                                    "corner_target_names", "edge_count", "corner_count", "solution_cases"):
                            self.assertEqual(actual[key], expected[key])
                            self.assertEqual(bulk["bulk_results"][0][key], expected[key])
                            self.assertEqual(bulk["bulk_results"][1][key], expected[key])


if __name__ == "__main__":
    unittest.main()
