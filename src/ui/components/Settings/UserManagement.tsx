import { useEffect, useState, useCallback } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Trash2, Loader2 } from "lucide-react";
import api from "../../axios";
import { toast } from "sonner";
import { AddUserModal } from "./AddUserModal";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "../ui/alert-dialog";

interface User {
    id: number;
    email: string;
    role: string;
    created_at: string;
}

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get("/users");
            setUsers(response.data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
            toast.error("Erreur lors du chargement des utilisateurs");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleDelete = async (userId: number) => {
        try {
            await api.delete(`/users/${userId}`);
            toast.success("Utilisateur supprimé");
            setUsers(users.filter((u) => u.id !== userId));
        } catch (error) {
            console.error("Failed to delete user:", error);
            toast.error("Erreur lors de la suppression");
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "admin":
                return <Badge variant="destructive">Administrateur</Badge>;
            case "doctor":
                return <Badge variant="default">Docteur</Badge>;
            case "receptionist":
                return <Badge variant="secondary">Réceptionniste</Badge>;
            default:
                return <Badge variant="outline">{role}</Badge>;
        }
    };

    if (loading && users.length === 0) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1 text-left">
                    <h2 className="text-2xl font-bold tracking-tight">Utilisateurs</h2>
                    <p className="text-muted-foreground">
                        Gérez les comptes d'accès à l'application.
                    </p>
                </div>
                <AddUserModal onUserAdded={fetchUsers} />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Rôle</TableHead>
                            <TableHead>Date de création</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    Aucun utilisateur trouvé.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium text-left">{user.email}</TableCell>
                                    <TableCell className="text-left">{getRoleBadge(user.role)}</TableCell>
                                    <TableCell className="text-left">
                                        {new Date(user.created_at).toLocaleDateString("fr-FR", {
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Cette action supprimera définitivement le compte de{" "}
                                                        <strong>{user.email}</strong>. Cette personne ne pourra plus se connecter.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(user.id)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Supprimer
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
