'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Contact, DEFAULT_TAGS } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Download, Upload } from 'lucide-react';

interface ContactTableProps {
  contacts: Contact[];
}

export function ContactTable({ contacts }: ContactTableProps) {
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState<string>('all');

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      // Search filter
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !search ||
        contact.full_name.toLowerCase().includes(searchLower) ||
        contact.email?.toLowerCase().includes(searchLower) ||
        contact.company?.toLowerCase().includes(searchLower) ||
        contact.job_title?.toLowerCase().includes(searchLower);

      // Tag filter
      const matchesTag =
        tagFilter === 'all' || contact.tags?.includes(tagFilter);

      return matchesSearch && matchesTag;
    });
  }, [contacts, search, tagFilter]);

  const handleExport = async () => {
    const response = await fetch('/api/export/csv');
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  };

  const getSourceBadge = (source: string) => {
    const colors: Record<string, string> = {
      gmail: 'bg-red-100 text-red-700',
      linkedin_csv: 'bg-blue-100 text-blue-700',
      manual: 'bg-gray-100 text-gray-700',
    };
    const labels: Record<string, string> = {
      gmail: 'Gmail',
      linkedin_csv: 'LinkedIn',
      manual: 'Manual',
    };
    return (
      <Badge variant="secondary" className={colors[source] || colors.manual}>
        {labels[source] || source}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Contacts</h1>
          <p className="text-sm text-gray-500">
            {filteredContacts.length} of {contacts.length} contacts
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/import">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Link href="/contacts/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={tagFilter} onValueChange={setTagFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {DEFAULT_TAGS.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Source</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  {contacts.length === 0 ? (
                    <div className="space-y-2">
                      <p>No contacts yet</p>
                      <p className="text-sm">
                        <Link href="/contacts/new" className="text-blue-600 hover:underline">
                          Add your first contact
                        </Link>{' '}
                        or{' '}
                        <Link href="/import" className="text-blue-600 hover:underline">
                          import from LinkedIn
                        </Link>
                      </p>
                    </div>
                  ) : (
                    'No contacts match your filters'
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredContacts.map((contact) => (
                <TableRow
                  key={contact.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => (window.location.href = `/contacts/${contact.id}`)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {contact.photo_url ? (
                        <img
                          src={contact.photo_url}
                          alt={contact.full_name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                          {contact.full_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div>{contact.full_name}</div>
                        {contact.job_title && (
                          <div className="text-sm text-gray-500">{contact.job_title}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">{contact.company || '-'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {contact.tags?.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{getSourceBadge(contact.source)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
