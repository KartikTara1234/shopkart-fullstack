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

test("Atlas configuration accepts standard TLS replica-set URIs", () => {
  assert.doesNotThrow(() =>
    validateAtlasUri(
      "mongodb://tara:p%40ss@cluster-shard-00.mongodb.net:27017,cluster-shard-01.mongodb.net:27017/tara?tls=true&authSource=admin&replicaSet=atlas-example",
    ),
  );
  assert.throws(() =>
    validateAtlasUri(
      "mongodb://tara:password@cluster.mongodb.net/tara?tls=false",
    ),
  );
  assert.throws(() =>
    validateAtlasUri(
      "mongodb://tara:password@cluster.mongodb.net,localhost/tara?tls=true",
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
