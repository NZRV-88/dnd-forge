import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="container mx-auto py-20">
      <div className="mx-auto max-w-xl rounded-2xl border bg-card p-10 text-center shadow-sm">
        <h1 className="text-5xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">Страница не найдена</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild>
            <Link to="/">На главную</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/create">Создать персонажа</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
