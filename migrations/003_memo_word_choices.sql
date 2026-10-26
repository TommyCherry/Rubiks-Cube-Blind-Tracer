CREATE TABLE memo_word_choices (
    user_id TEXT NOT NULL,
    pair TEXT NOT NULL,
    word TEXT NOT NULL,
    PRIMARY KEY (user_id, pair)
);
