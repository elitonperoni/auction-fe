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
  const publicPaths = ["/login", "/"];

  // 4. Verifica se a rota acessada é pública
  const isPublicPath = publicPaths.some((path) => {
    // Se a rota pública for a raiz '/', exigimos que seja EXATAMENTE igual
    if (path === "/") {
      return pathname === "/";
    }
    // Para outras rotas (ex: /login), pode usar o startsWith (para pegar /login/esqueceu-senha, etc)
    return pathname.startsWith(path);
  });

  // --- LÓGICA DE REDIRECIONAMENTO ---

  // Se a rota é pública, deixe passar
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Se a rota NÃO é pública e o usuário NÃO tem token,
  // redirecione para /login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    // (Opcional) Adiciona a URL original para redirecionar de volta após o login
    loginUrl.searchParams.set("from", pathname);

    return NextResponse.redirect(loginUrl);
  }

  // Se a rota não é pública e o usuário TEM token, deixe passar
  return NextResponse.next();
}

// 5. Configuração do Matcher (Quais rotas o Middleware deve rodar)
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