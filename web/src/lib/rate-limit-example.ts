/**
 * Rate Limiting Usage Examples
 *
 * Cycle 7: Better Auth Roadmap - Example implementations
 *
 * This file demonstrates how to apply rate limiting to various endpoints.
 * These examples will be integrated in Cycle 8 when applying to actual endpoints.
 */

import {
  checkRateLimit,
  updateRateLimit,
  getRateLimitHeaders,
  getClientIdentifier,
  createRateLimitMiddleware,
  type RateLimitCheckResult,
} from "./rate-limit";

/**
 * Example 1: Sign-In Endpoint with Rate Limiting
 *
 * Protects against brute force attacks and credential stuffing
 */
export async function signInWithRateLimit(request: Request): Promise<Response> {
  // Extract client identifier (IP address)
  const identifier = getClientIdentifier(request);

  // Check rate limit
  const rateLimitCheck = checkRateLimit("signIn", identifier);

  // Return 429 if rate limited
  if (!rateLimitCheck.allowed) {
    return new Response(
      JSON.stringify({
        error: "Too many sign-in attempts",
        retryAfter: rateLimitCheck.retryAfter,
        message: `Please try again in ${rateLimitCheck.retryAfter} seconds`,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          ...getRateLimitHeaders(rateLimitCheck),
        },
      }
    );
  }

  // Process sign-in request
  const data = await request.json();
  let success = false;

  try {
    // Call Better Auth sign-in logic here
    // const result = await betterAuth.signIn(data);
    // success = result.success;

    // Simulated for example
    success = data.email && data.password;
  } catch (error) {
    success = false;
  }

  // Update rate limit (increment attempts, track failures)
  updateRateLimit("signIn", identifier, success);

  // Return response with rate limit headers
  return new Response(
    JSON.stringify({ success }),
    {
      status: success ? 200 : 401,
      headers: {
        "Content-Type": "application/json",
        ...getRateLimitHeaders(rateLimitCheck),
      },
    }
  );
}

/**
 * Example 2: Sign-Up Endpoint with Rate Limiting
 *
 * Protects against account enumeration and spam registration
 */
export async function signUpWithRateLimit(request: Request): Promise<Response> {
  const identifier = getClientIdentifier(request);
  const rateLimitCheck = checkRateLimit("signUp", identifier);

  if (!rateLimitCheck.allowed) {
    return new Response(
      JSON.stringify({
        error: "Too many sign-up attempts",
        retryAfter: rateLimitCheck.retryAfter,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          ...getRateLimitHeaders(rateLimitCheck),
        },
      }
    );
  }

  const data = await request.json();
  let success = false;

  try {
    // Call Better Auth sign-up logic here
    // const result = await betterAuth.signUp(data);
    // success = result.success;
    success = true; // Simulated
  } catch (error) {
    success = false;
  }

  updateRateLimit("signUp", identifier, success);

  return new Response(
    JSON.stringify({ success }),
    {
      status: success ? 201 : 400,
      headers: {
        "Content-Type": "application/json",
        ...getRateLimitHeaders(rateLimitCheck),
      },
    }
  );
}

/**
 * Example 3: Password Reset Request with Rate Limiting
 *
 * Protects against email enumeration and spam
 */
export async function passwordResetWithRateLimit(
  request: Request
): Promise<Response> {
  const identifier = getClientIdentifier(request);
  const rateLimitCheck = checkRateLimit("passwordResetRequest", identifier);

  if (!rateLimitCheck.allowed) {
    return new Response(
      JSON.stringify({
        error: "Too many password reset requests",
        retryAfter: rateLimitCheck.retryAfter,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          ...getRateLimitHeaders(rateLimitCheck),
        },
      }
    );
  }

  const data = await request.json();
  const { email } = data;

  // Always return success to prevent email enumeration
  // But still track rate limit per email
  updateRateLimit("passwordResetRequest", email, true);

  // Send password reset email (if email exists)
  // await sendPasswordResetEmail(email);

  return new Response(
    JSON.stringify({
      success: true,
      message:
        "If an account exists with that email, a reset link has been sent",
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...getRateLimitHeaders(rateLimitCheck),
      },
    }
  );
}

/**
 * Example 4: Using Middleware Helper
 *
 * Simplifies rate limiting with pre-configured middleware
 */
export async function apiEndpointWithMiddleware(
  request: Request
): Promise<Response> {
  // Create rate limiter for this endpoint
  const rateLimiter = createRateLimitMiddleware("api");
  const identifier = getClientIdentifier(request);

  // Check rate limit
  const result = rateLimiter.check(identifier);

  if (!result.allowed) {
    return new Response("Too many requests", {
      status: 429,
      headers: rateLimiter.getHeaders(result),
    });
  }

  // Process request
  const data = await processApiRequest(request);

  // Update rate limit
  rateLimiter.update(identifier, true);

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ...rateLimiter.getHeaders(result),
    },
  });
}

async function processApiRequest(request: Request): Promise<unknown> {
  // Simulated API processing
  return { message: "API request processed" };
}

/**
 * Example 5: Dual Rate Limiting (IP + User)
 *
 * Rate limit by both IP and authenticated user ID
 */
export async function dualRateLimitExample(
  request: Request,
  userId?: string
): Promise<Response> {
  const identifier = getClientIdentifier(request);

  // Check IP-based rate limit
  const ipRateLimit = checkRateLimit("api", identifier);

  if (!ipRateLimit.allowed) {
    return new Response("Too many requests from this IP", {
      status: 429,
      headers: getRateLimitHeaders(ipRateLimit),
    });
  }

  // Check user-based rate limit (if authenticated)
  if (userId) {
    const userRateLimit = checkRateLimit("api", userId);

    if (!userRateLimit.allowed) {
      return new Response("Too many requests for this account", {
        status: 429,
        headers: getRateLimitHeaders(userRateLimit),
      });
    }

    // Update both rate limits
    updateRateLimit("api", userId, true);
  }

  updateRateLimit("api", identifier, true);

  return new Response(
    JSON.stringify({ success: true }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...getRateLimitHeaders(ipRateLimit),
      },
    }
  );
}

/**
 * Example 6: Rate Limit Error Response
 *
 * Consistent error formatting with helpful messages
 */
export function createRateLimitErrorResponse(
  result: RateLimitCheckResult,
  endpoint: string
): Response {
  const retryMinutes = Math.ceil(result.retryAfter / 60);

  return new Response(
    JSON.stringify({
      error: "rate_limit_exceeded",
      message: `Too many ${endpoint} attempts. Please try again in ${retryMinutes} minute${retryMinutes !== 1 ? "s" : ""}.`,
      retryAfter: result.retryAfter,
      limit: result.limit,
      endpoint,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        ...getRateLimitHeaders(result),
      },
    }
  );
}

/**
 * Example 7: Astro API Route with Rate Limiting
 *
 * How to use in Astro API endpoint
 */
export async function astroApiRouteExample(
  context: {
    request: Request;
  }
): Promise<Response> {
  const { request } = context;
  const identifier = getClientIdentifier(request);

  const rateLimitCheck = checkRateLimit("api", identifier);

  if (!rateLimitCheck.allowed) {
    return createRateLimitErrorResponse(rateLimitCheck, "API");
  }

  // Process request
  const data = await request.json();
  const result = await processData(data);

  updateRateLimit("api", identifier, true);

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ...getRateLimitHeaders(rateLimitCheck),
    },
  });
}

async function processData(data: unknown): Promise<unknown> {
  // Simulated data processing
  return data;
}

/**
 * Example 8: Client-Side Rate Limit Handling
 *
 * How to handle rate limit responses in frontend
 */
export async function clientSideRateLimitExample() {
  const response = await fetch("/api/auth/signin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "user@example.com",
      password: "password123",
    }),
  });

  // Check if rate limited
  if (response.status === 429) {
    const data = await response.json();
    const retryAfter = response.headers.get("Retry-After");
    const retryMinutes = retryAfter
      ? Math.ceil(parseInt(retryAfter) / 60)
      : 0;

    console.error(`Rate limited. Retry in ${retryMinutes} minutes`);

    // Show user-friendly message
    alert(
      data.message ||
        `Too many attempts. Please try again in ${retryMinutes} minutes.`
    );

    // Disable submit button for retryAfter seconds
    const submitButton = document.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;
    if (submitButton && retryAfter) {
      submitButton.disabled = true;
      submitButton.textContent = `Retry in ${retryMinutes}m`;

      setTimeout(() => {
        submitButton.disabled = false;
        submitButton.textContent = "Sign In";
      }, parseInt(retryAfter) * 1000);
    }

    return;
  }

  // Process successful response
  const data = await response.json();
  console.log("Sign in result:", data);
}
