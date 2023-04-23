import { IRequest, Router } from "itty-router";
import verifySignature from "./middleware/discord";
import { Env } from ".";

export default function Routes(env: Env) {
  return (
    Router()
      // .all('*', (request: Request) => {
      //   // Patch the request with system libs (?)
      //   request = {
      //     env,
      //     ...request
      //   }
      // })
      .get("/", (request: IRequest) => WelcomeController(env, request))
      .post(
        "/interaction",
        verifySignature(env.DISCORD_PUBLIC_KEY),
        () => new Response("Hello Discord")
      )
      .all("*", () => new Response("Not Found.", { status: 404 }))
  );
}

async function WelcomeController({ DB }: Env, request: IRequest) {
  const test = await DB.get("test");

  console.log(test);
  return new Response("Hello World");
}
/*
router.get('/todos', () => new Response('Todos Index!'))

router.get('/todos/:id', ({ params }) => new Response(`Todo #${params.id}`))

router.post('/todos', async request => {
  const content = await request.json()

  return new Response('Creating Todo: ' + JSON.stringify(content))
})

router.post('/interaction', verifySignature())

// 404 for everything else
router.all('*', () => new Response('Not Found.', { status: 404 }));

export default router;

if (request.method !== 'POST')
      return new Response('Method Not Allowed.', { status: 405 });

    const body = await request.json() as Interaction;

    console.log(JSON.stringify(body, null, 2));
    // console.log(body.data.options);

    if (body.type === InteractionType.PING) {
      // Respond to a ping
      return json({ type: 1 });
    }

    const response = await interactionResponse(body, env.ALIAS_DB);

    return json(response);
	},
  */
