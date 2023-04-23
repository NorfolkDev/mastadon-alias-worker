import { IRequest } from "itty-router";
import { verifyRequestSignature } from "../lib/crypto";

export default function verifySignature(key: string) {
  return async (request: IRequest) => {
    const verified = await verifyRequestSignature(key, request);

    if (!verified) return new Response("Invalid Request", { status: 401 });
  };
}
