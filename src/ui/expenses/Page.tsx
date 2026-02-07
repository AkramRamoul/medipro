import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import { Label } from "../components/ui/label";
import { PlusCircle, Trash2, Wallet, Receipt } from "lucide-react";
import { toast } from "sonner";
import { Expense } from "../type";

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newExpense, setNewExpense] = useState({
        description: "",
        amount: "",
        category: "other",
    });

    const fetchExpenses = async () => {
        try {
            setIsLoading(true);
            const data = await window.electronAPI.getExpenses();
            setExpenses(data);
        } catch (error) {
            console.error("Failed to fetch expenses:", error);
            toast.error("Erreur lors du chargement des dépenses");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const handleAddExpense = async () => {
        if (!newExpense.description || !newExpense.amount) {
            toast.error("Veuillez remplir tous les champs");
            return;
        }

        try {
            const amount = parseInt(newExpense.amount);
            if (isNaN(amount)) {
                toast.error("Le montant doit être un nombre");
                return;
            }

            await window.electronAPI.addExpense({
                description: newExpense.description,
                amount,
                category: newExpense.category,
            });

            toast.success("Dépense ajoutée avec succès");
            setIsDialogOpen(false);
            setNewExpense({ description: "", amount: "", category: "other" });
            fetchExpenses();
        } catch (error) {
            console.error("Failed to add expense:", error);
            toast.error("Erreur lors de l'ajout de la dépense");
        }
    };

    const handleDeleteExpense = async (id: number) => {
        try {
            await window.electronAPI.deleteExpense(id);
            toast.success("Dépense supprimée");
            fetchExpenses();
        } catch (error) {
            console.error("Failed to delete expense:", error);
            toast.error("Erreur lors de la suppression");
        }
    };

    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-background text-foreground min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Wallet className="w-8 h-8 text-primary" /> Gestion des Dépenses
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Suivez et gérez les coûts de votre clinique.
                    </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <PlusCircle className="w-4 h-4" /> Ajouter une dépense
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Nouvelle Dépense</DialogTitle>
                            <DialogDescription>
                                Remplissez les détails de la dépense ci-dessous.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    placeholder="ex: Loyer, Fournitures médicales..."
                                    value={newExpense.description}
                                    onChange={(e) =>
                                        setNewExpense({ ...newExpense, description: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="amount">Montant (DA)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="0.00"
                                    value={newExpense.amount}
                                    onChange={(e) =>
                                        setNewExpense({ ...newExpense, amount: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Catégorie</Label>
                                <Select
                                    value={newExpense.category}
                                    onValueChange={(val) =>
                                        setNewExpense({ ...newExpense, category: val })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choisir une catégorie" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="supplies">Fournitures</SelectItem>
                                        <SelectItem value="rent">Loyer / Factures</SelectItem>
                                        <SelectItem value="staff">Personnel</SelectItem>
                                        <SelectItem value="other">Autre</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Annuler
                            </Button>
                            <Button onClick={handleAddExpense}>Enregistrer</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="shadow-sm rounded-xl overflow-hidden border-none ring-1 ring-border/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total des Dépenses
                        </CardTitle>
                        <div className="bg-red-100 p-2 rounded-full dark:bg-red-900/30">
                            <Receipt className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalExpenses.toLocaleString()} DA</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Cumul total enregistré
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-sm rounded-xl overflow-hidden border-none ring-1 ring-border/50">
                <CardHeader>
                    <CardTitle>Historique des Dépenses</CardTitle>
                    <CardDescription>
                        Liste complète de toutes les dépenses enregistrées.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="py-10 text-center text-muted-foreground">Chargement...</div>
                    ) : expenses.length === 0 ? (
                        <div className="py-10 text-center text-muted-foreground">
                            Aucune dépense enregistrée.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Catégorie</TableHead>
                                    <TableHead className="text-right">Montant</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expenses.map((expense) => (
                                    <TableRow key={expense.id}>
                                        <TableCell className="font-medium text-muted-foreground text-sm">
                                            {new Date(expense.date).toLocaleDateString("fr-FR")}
                                        </TableCell>
                                        <TableCell className="font-medium">{expense.description}</TableCell>
                                        <TableCell>
                                            <span className="capitalize text-xs px-2 py-1 rounded-full bg-muted">
                                                {expense.category === "supplies"
                                                    ? "Fournitures"
                                                    : expense.category === "rent"
                                                        ? "Loyer"
                                                        : expense.category === "staff"
                                                            ? "Personnel"
                                                            : "Autre"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {expense.amount.toLocaleString()} DA
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                                                onClick={() => handleDeleteExpense(expense.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
