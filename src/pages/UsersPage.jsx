import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function UsersPage() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase
            .from('profiles')
            .select('*')
            .order('updated_at', { ascending: false })
            .then(({ data, error }) => {
                if (error) console.error(error)
                else setUsers(data ?? [])
                setLoading(false)
            })
    }, [])

    const totalUsers = users.length
    const verifiedUsers = users.filter((u) => u.phone_verified).length
    const verifiedRate =
        totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0
    const updatedThisWeek = users.filter(
        (u) =>
            u.updated_at &&
            new Date(u.updated_at) > new Date(Date.now() - 7 * 864e5)
    ).length

    const getInitials = (name) => {
        if (!name) return '?'
        return name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold">My Users</h2>
                <p className="text-muted-foreground">
                    Manage and monitor SafeBuddy user profiles
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Users
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{totalUsers}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Phone Verified
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{verifiedUsers}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {verifiedRate}% of total
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Unverified
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {totalUsers - verifiedUsers}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Active This Week
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{updatedThisWeek}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Profiles</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-muted-foreground">Loading profiles…</p>
                    ) : users.length === 0 ? (
                        <p className="text-muted-foreground">No profiles found.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Last Updated</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((u) => (
                                    <TableRow key={u.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={u.avatar_url} alt={u.full_name} />
                                                    <AvatarFallback>
                                                        {getInitials(u.full_name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">
                                                        {u.full_name ?? 'Unnamed'}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground font-mono">
                                                        {u.id.slice(0, 8)}…
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {u.phone ?? (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {u.phone_verified ? (
                                                <Badge variant="default">Verified</Badge>
                                            ) : (
                                                <Badge variant="secondary">Unverified</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {u.updated_at
                                                ? new Date(u.updated_at).toLocaleDateString()
                                                : '—'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}