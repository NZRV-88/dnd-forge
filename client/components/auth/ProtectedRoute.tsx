import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const user = useAuth();

    if (user === undefined) {
        // ещё грузим данные
        return <div className="p-4">Загрузка...</div>;
    }

    if (!user) {
        // если не залогинен → редирект на логин
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}
