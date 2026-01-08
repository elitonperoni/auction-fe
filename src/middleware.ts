import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// O nome do cookie que você definiu no Passo 1
const AUTH_COOKIE_NAME = "auth-token";

export function middleware(request: NextRequest) {
  // 1. Pega o token do cookie da requisição
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  // 2. Pega a URL que o usuário está tentando acessar
  const { pathname } = request.nextUrl;

  // 3. Define quais rotas são públicas
  const publicPaths = [
    "/",
    "/login", 
    "/reset-password", 
    "/recovery-password",     
    "/register",
  ];

  const isPublicPath = publicPaths.some((path) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  });

  if (isPublicPath) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Combine todas as rotas, exceto:
     * - /api (rotas de API)
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagens)
     * - favicon.ico (ícone)
     *
     * Isso garante que o middleware rode em TODAS as suas páginas.
     */
   '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};