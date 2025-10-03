interface Env {
	BASIC_AUTH_USER: string;
	BASIC_AUTH_PASS: string;
}

const isAuthorized = (request: Request, env: Env): boolean => {
	const authHeader = request.headers.get('Authorization');

	if (!authHeader || !authHeader.startsWith('Basic ')) {
		return false;
	}

	const encodedCreds = authHeader.substring(6);

	try {
		const decodedCreds = atob(encodedCreds);
		const [username, password] = decodedCreds.split(':');
		const validUser = env.BASIC_AUTH_USER;
		const validPass = env.BASIC_AUTH_PASS;

		if (!validUser || !validPass) {
			console.error("Missing BASIC_AUTH_USER or BASIC_AUTH_PASS environment variables.");
			return false;
		}

		return username === validUser && password === validPass;
	} catch (err) {
		return false;
	}
};

export const onRequest: PagesFunction<Env> = async (context) => {
	if (isAuthorized(context.request, context.env)) {
		return context.next();
	}

	return new Response('Authentication required', {
		status: 401,
		headers: {
			'WWW-Authenticate': 'Basic realm="Secure Area"',
		},
	});
};