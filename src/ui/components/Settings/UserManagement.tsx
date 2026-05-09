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
import { Trash2, Loader2, Edit2, CheckCircle2, XCircle } from "lucide-react";
import api from "../../axios";
import { toast } from "sonner";
import { AddUserModal } from "./AddUserModal";
import { useAuth } from "../../context/auth-context";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card";
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
    role: "admin" | "doctor" | "receptionist";
    createdAt: string;
}

export default function UserManagement() {
    const { user: currentUser } = useAuth();
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
        } catch (error: any) {
            console.error("Failed to delete user:", error);
            // Default error if backend message is unavailable
            let errorMessage = "Erreur lors de la suppression";
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            toast.error(errorMessage);
        }
    };

    const handleRoleChange = async (userId: number, newRole: string) => {
        try {
            await api.patch(`/users/${userId}/role`, { role: newRole });
            toast.success("Rôle mis à jour");
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as User["role"] } : u));
        } catch (error: any) {
            console.error("Failed to update role:", error);
            let errorMessage = "Erreur lors de la mise à jour";
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            toast.error(errorMessage);
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

    const EditableRoleBadge = ({ user }: { user: User }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [tempRole, setTempRole] = useState(user.role);

        if (!isEditing || user.id === currentUser?.id) {
            return (
                <div
                    className={`flex items-center gap-2 ${user.id !== currentUser?.id ? 'cursor-pointer hover:opacity-80' : ''}`}
                    onClick={() => {
                        if (user.id !== currentUser?.id) setIsEditing(true);
                    }}
                    title={user.id !== currentUser?.id ? "Cliquez pour modifier" : "Vous ne pouvez pas modifier votre propre rôle"}
                >
                    {getRoleBadge(user.role)}
                    {user.id !== currentUser?.id && <Edit2 className="h-3 w-3 text-muted-foreground hidden group-hover:block" />}
                </div>
            )
        }

        return (
            <div className="flex items-center gap-2">
                <select
                    title="Sélectionner le Rôle"
                    className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={tempRole}
                    onChange={(e) => setTempRole(e.target.value as User["role"])}
                    autoFocus
                >
                    <option value="admin">Administrateur</option>
                    <option value="doctor">Docteur</option>
                    <option value="receptionist">Réceptionniste</option>
                </select>
                <div className="flex items-center gap-1">
                    <button
                        title="Enregistrer"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50 p-1 rounded"
                        onClick={() => {
                            if (tempRole !== user.role) handleRoleChange(user.id, tempRole);
                            setIsEditing(false);
                        }}
                    >
                        <CheckCircle2 className="h-4 w-4" />
                    </button>
                    <button
                        title="Annuler"
                        className="text-destructive hover:text-red-700 hover:bg-red-50 p-1 rounded"
                        onClick={() => setIsEditing(false)}
                    >
                        <XCircle className="h-4 w-4" />
                    </button>
                </div>
            </div>
        )
    }

    const permissionsInfo = [
        {
            role: "Administrateur",
            permissions: ["Accès total", "Gestion des utilisateurs", "Paramètres système", "Données médicales", "Finances"],
            color: "text-destructive"
        },
        {
            role: "Docteur",
            permissions: ["Données médicales (Détails)", "Consultations", "Ordonnances", "Recherche patients"],
            color: "text-primary"
        },
        {
            role: "Réceptionniste",
            permissions: ["Recherche patients", "Informations de base patients", "Prise de rendez-vous"],
            color: "text-muted-foreground"
        }
    ];

    if (loading && users.length === 0) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1 text-left">
                    <h2 className="text-2xl font-bold tracking-tight">Utilisateurs & Permissions</h2>
                    <p className="text-muted-foreground">
                        Gérez les comptes d'accès et consultez les privilèges par rôle.
                    </p>
                </div>
                <AddUserModal onUserAdded={fetchUsers} />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {permissionsInfo.map((info) => (
                    <Card key={info.role} className="border-muted">
                        <CardHeader className="pb-3">
                            <CardTitle className={`text-sm font-bold ${info.color}`}>{info.role}</CardTitle>
                            <CardDescription>Privilèges accordés</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm text-left">
                                {info.permissions.map((p) => (
                                    <li key={p} className="flex items-center gap-2">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                        <span>{p}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Liste des utilisateurs</h3>
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
                                    <TableRow key={user.id} className="group">
                                        <TableCell className="font-medium text-left">
                                            {user.email}
                                            {user.id === currentUser?.id && <Badge variant="outline" className="ml-2 text-[10px] h-4 px-1 py-0 border-primary text-primary">Vous</Badge>}
                                        </TableCell>
                                        <TableCell className="text-left w-64">
                                            <EditableRoleBadge user={user} />
                                        </TableCell>
                                        <TableCell className="text-left">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR", {
                                                day: "2-digit",
                                                month: "long",
                                                year: "numeric",
                                            }) : "N/A"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        title="Supprimer"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        disabled={user.id === currentUser?.id}
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
        </div>
    );
}
