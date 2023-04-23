import { IRequest } from "itty-router";

export async function verifyRequestSignature(
  key: string,
  request: IRequest
): Promise<boolean> {
  const timestamp = request.headers.get("X-Signature-Timestamp");
  const sig = request.headers.get("X-Signature-Ed25519");

  if (
    timestamp == null || // No timestamp provided
    parseInt(timestamp) < Date.now() / 5000 || // Request older than 5s
    sig === null // No signature given
  ) {
    return Promise.resolve(false);
  }

  const body = await request.clone().text();

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    hexToUInt8Array(key),
    { name: "NODE-ED25519", namedCurve: "NODE-ED25519" },
    false,
    ["verify"]
  );

  return crypto.subtle.verify(
    "NODE-ED25519",
    cryptoKey,
    hexToUInt8Array(sig),
    new TextEncoder().encode(timestamp + body)
  );
}

function hexToUInt8Array(string: string) {
  // convert string to pairs of 2 characters
  const pairs = string.match(/[\dA-F]{2}/gi) as RegExpMatchArray;

  // convert the octets to integers
  const integers = pairs.map(function (s) {
    return parseInt(s, 16);
  });

  return new Uint8Array(integers);
}
