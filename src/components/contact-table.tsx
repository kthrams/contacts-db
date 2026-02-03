'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Contact, DEFAULT_TAGS, UserPreferences, DEFAULT_USER_PREFERENCES } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Search, Download, Upload, ArrowUp, ArrowDown, Trash2, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

type SortColumn = UserPreferences['sort_column'];
type SortDirection = UserPreferences['sort_direction'];

interface ContactTableProps {
  contacts: Contact[];
}

export function ContactTable({ contacts }: ContactTableProps) {
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState<string>('all');

  // Preferences state
  const [sortColumn, setSortColumn] = useState<SortColumn>(DEFAULT_USER_PREFERENCES.sort_column);
  const [sortDirection, setSortDirection] = useState<SortDirection>(DEFAULT_USER_PREFERENCES.sort_direction);
  const [rowsPerPage, setRowsPerPage] = useState<number>(DEFAULT_USER_PREFERENCES.rows_per_page);
  const [currentPage, setCurrentPage] = useState(1);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Fetch preferences on mount
  useEffect(() => {
    async function fetchPreferences() {
      try {
        const response = await fetch('/api/preferences');
        if (response.ok) {
          const prefs: UserPreferences = await response.json();
          setSortColumn(prefs.sort_column);
          setSortDirection(prefs.sort_direction);
          setRowsPerPage(prefs.rows_per_page);
        }
      } catch (error) {
        console.error('Failed to fetch preferences:', error);
      } finally {
        setPreferencesLoaded(true);
      }
    }
    fetchPreferences();
  }, []);

  // Save preferences when they change
  const savePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    try {
      await fetch('/api/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }, []);

  // Handle sort column click
  const handleSort = (column: SortColumn) => {
    let newDirection: SortDirection = 'asc';
    if (sortColumn === column) {
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    }
    setSortColumn(column);
    setSortDirection(newDirection);
    setCurrentPage(1);
    savePreferences({ sort_column: column, sort_direction: newDirection });
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (value: string) => {
    const numValue = parseInt(value);
    setRowsPerPage(numValue);
    setCurrentPage(1);
    savePreferences({ rows_per_page: numValue as UserPreferences['rows_per_page'] });
  };

  // Filter, sort, and paginate contacts
  const processedContacts = useMemo(() => {
    // First filter
    let result = contacts.filter((contact) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !search ||
        contact.full_name.toLowerCase().includes(searchLower) ||
        contact.email?.toLowerCase().includes(searchLower) ||
        contact.company?.toLowerCase().includes(searchLower) ||
        contact.job_title?.toLowerCase().includes(searchLower);

      const matchesTag =
        tagFilter === 'all' || contact.tags?.includes(tagFilter);

      return matchesSearch && matchesTag;
    });

    // Then sort
    result = [...result].sort((a, b) => {
      let aValue: string | string[] | null = null;
      let bValue: string | string[] | null = null;

      switch (sortColumn) {
        case 'full_name':
          aValue = a.full_name;
          bValue = b.full_name;
          break;
        case 'company':
          aValue = a.company || '';
          bValue = b.company || '';
          break;
        case 'tags':
          // Sort by number of tags, then alphabetically by first tag
          const aTagCount = a.tags?.length || 0;
          const bTagCount = b.tags?.length || 0;
          if (aTagCount !== bTagCount) {
            return sortDirection === 'asc' ? aTagCount - bTagCount : bTagCount - aTagCount;
          }
          aValue = a.tags?.[0] || '';
          bValue = b.tags?.[0] || '';
          break;
        case 'source':
          aValue = a.source;
          bValue = b.source;
          break;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      }
      return 0;
    });

    return result;
  }, [contacts, search, tagFilter, sortColumn, sortDirection]);

  // Paginated contacts
  const paginatedContacts = useMemo(() => {
    if (rowsPerPage === -1) return processedContacts;
    const start = (currentPage - 1) * rowsPerPage;
    return processedContacts.slice(start, start + rowsPerPage);
  }, [processedContacts, currentPage, rowsPerPage]);

  const totalPages = rowsPerPage === -1 ? 1 : Math.ceil(processedContacts.length / rowsPerPage);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(paginatedContacts.map(c => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const isAllSelected = paginatedContacts.length > 0 && paginatedContacts.every(c => selectedIds.has(c.id));
  const isSomeSelected = selectedIds.size > 0;

  // Bulk actions
  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} contacts?`)) return;

    try {
      const deletePromises = Array.from(selectedIds).map(id =>
        fetch(`/api/contacts/${id}`, { method: 'DELETE' })
      );
      await Promise.all(deletePromises);
      window.location.reload();
    } catch (error) {
      console.error('Failed to delete contacts:', error);
    }
  };

  const handleBulkExport = async () => {
    const selectedContacts = contacts.filter(c => selectedIds.has(c.id));
    const headers = ['Name', 'Email', 'Company', 'Job Title', 'Phone', 'LinkedIn', 'Tags', 'Source'];
    const rows = selectedContacts.map(c => [
      c.full_name,
      c.email || '',
      c.company || '',
      c.job_title || '',
      c.phone || '',
      c.linkedin_url || '',
      c.tags?.join('; ') || '',
      c.source,
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts-selected-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

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

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 inline ml-1" />
    );
  };

  // Don't render until preferences are loaded to avoid flash
  if (!preferencesLoaded) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Contacts</h1>
          <p className="text-sm text-gray-500">
            {processedContacts.length} of {contacts.length} contacts
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/import">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </Link>
          <Button size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {isSomeSelected && (
        <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <span className="text-sm font-medium text-blue-900">
            {selectedIds.size} selected
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleBulkExport}>
              <Download className="h-4 w-4 mr-2" />
              Export Selected
            </Button>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
            Clear selection
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="pl-10"
          />
        </div>
        <Select value={tagFilter} onValueChange={(v) => { setTagFilter(v); setCurrentPage(1); }}>
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
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[1%] whitespace-nowrap">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead
                className="w-[35%] cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('full_name')}
              >
                Name <SortIcon column="full_name" />
              </TableHead>
              <TableHead
                className="w-[25%] cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('company')}
              >
                Company <SortIcon column="company" />
              </TableHead>
              <TableHead
                className="w-[15%] cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('tags')}
              >
                Tags <SortIcon column="tags" />
              </TableHead>
              <TableHead
                className="w-[15%] cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('source')}
              >
                Source <SortIcon column="source" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedContacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  {contacts.length === 0 ? (
                    <div className="space-y-2">
                      <p>No contacts yet</p>
                      <p className="text-sm">
                        <Link href="/import" className="text-blue-600 hover:underline">
                          Import from LinkedIn
                        </Link>{' '}
                        to get started
                      </p>
                    </div>
                  ) : (
                    'No contacts match your filters'
                  )}
                </TableCell>
              </TableRow>
            ) : (
              paginatedContacts.map((contact) => (
                <TableRow
                  key={contact.id}
                  className={`hover:bg-gray-50 ${selectedIds.has(contact.id) ? 'bg-blue-50' : ''}`}
                >
                  <TableCell className="w-[1%] whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.has(contact.id)}
                      onCheckedChange={(checked) => handleSelectOne(contact.id, checked as boolean)}
                      aria-label={`Select ${contact.full_name}`}
                    />
                  </TableCell>
                  <TableCell
                    className="font-medium cursor-pointer"
                    onClick={() => (window.location.href = `/contacts/${contact.id}`)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {contact.photo_url ? (
                        <img
                          src={contact.photo_url}
                          alt={contact.full_name}
                          className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600 flex-shrink-0">
                          {contact.full_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="truncate">{contact.full_name}</span>
                          {contact.linkedin_url && (
                            <a
                              href={contact.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                        {contact.job_title && (
                          <div className="text-sm text-gray-500 truncate">{contact.job_title}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell
                    className="text-gray-600 truncate cursor-pointer"
                    onClick={() => (window.location.href = `/contacts/${contact.id}`)}
                  >
                    {contact.company || '-'}
                  </TableCell>
                  <TableCell
                    className="cursor-pointer"
                    onClick={() => (window.location.href = `/contacts/${contact.id}`)}
                  >
                    <div className="flex flex-wrap gap-1">
                      {contact.tags?.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell
                    className="cursor-pointer"
                    onClick={() => (window.location.href = `/contacts/${contact.id}`)}
                  >
                    {getSourceBadge(contact.source)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Rows per page:</span>
          <Select value={rowsPerPage.toString()} onValueChange={handleRowsPerPageChange}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="1000">1000</SelectItem>
              <SelectItem value="-1">All</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {rowsPerPage === -1 ? (
              `Showing all ${processedContacts.length} contacts`
            ) : (
              `Showing ${Math.min((currentPage - 1) * rowsPerPage + 1, processedContacts.length)}-${Math.min(currentPage * rowsPerPage, processedContacts.length)} of ${processedContacts.length}`
            )}
          </span>

          {rowsPerPage !== -1 && totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
