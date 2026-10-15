import test from "node:test";
import assert from "node:assert/strict";
import { validateAtlasUri } from "../backend/config/env.js";

test("Atlas configuration accepts a complete SRV URI", () => {
  assert.doesNotThrow(() =>
    validateAtlasUri(
      "mongodb+srv://tara:p%40ss@cluster.example.mongodb.net/tara?retryWrites=true&w=majority",
    ),
  );
});

test("Atlas configuration rejects local databases, placeholders and incomplete URIs", () => {
  for (const uri of [
    "",
    "mongodb://127.0.0.1:27017/tara",
    "mongodb+srv://user:password@localhost/tara",
    "mongodb+srv://<user>:<password>@cluster.mongodb.net/tara",
    "mongodb+srv://cluster.mongodb.net/tara",
    "mongodb+srv://user:password@cluster.mongodb.net/",
  ]) {
    assert.throws(() => validateAtlasUri(uri));
  }
});
