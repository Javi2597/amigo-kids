import test from "node:test";
import assert from "node:assert/strict";
import { parseVisionResult } from "./visionParse.ts";

const OK = '{"safe":true,"message":"Veo un perro café jugando. ¿Es tuyo?"}';

test("acepta el JSON limpio", () => {
  const out = parseVisionResult(OK);
  assert.equal(out.safe, true);
  assert.match(out.message, /perro/);
});

test("tolera los formatos que devuelven los modelos", () => {
  const variantes = [
    "```json\n" + OK + "\n```",
    "```\n" + OK + "\n```",
    "<thinking>la foto parece un animal</thinking>" + OK,
    "Claro, aquí va: " + OK + " ¡Listo!",
    '{\n  "safe": true,\n  "message": "Veo un perro café jugando. ¿Es tuyo?"\n}',
  ];
  for (const raw of variantes) {
    const out = parseVisionResult(raw);
    assert.equal(out.safe, true, `no parseó: ${raw}`);
    assert.match(out.message, /perro/, `no parseó: ${raw}`);
  }
});

test("es fail-closed: ante cualquier duda no se describe la foto", () => {
  const malos = [
    "",
    "no puedo responder eso",
    "{roto",
    '{"safe":true}',
    '{"safe":true,"message":""}',
    '{"safe":false,"message":"Veo algo feo"}',
    "null",
    "[]",
  ];
  for (const raw of malos) {
    assert.equal(
      parseVisionResult(raw).safe,
      false,
      `debería ser inseguro: ${JSON.stringify(raw)}`
    );
  }
});

test("un safe:false nunca arrastra la descripción", () => {
  const out = parseVisionResult('{"safe":false,"message":"hay un arma"}');
  assert.equal(out.safe, false);
});
