import { useState, ChangeEvent, useMemo } from "react";
import { MatchIdentifier } from "../types/MatchData";
import { Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Toolbar, Tooltip, Typography } from "@mui/material";
import { alpha } from '@mui/material/styles';
import useLocalStorageState from "./hooks/localStorageState";

interface DataListProps {
    /** The list of matches to be displayed, can be large in size as this table uses pages */
    entries: MatchIdentifier[]|undefined, 
    /** The matches that have been marked as scanned */
    readEntries: number[], 
    /** The user has selected these matches to be deleted */
    deleteItems: (entries: number[]) => void,
    /** The user has selected these entries to be marked as scanned. (These should be ADDED to the `readEntries` array passed to this component) */
    markRead: (entries: number[]) => void,
    /** The user has selected these entries to be marked as new. (These should be REMOVED from to the `readEntries` array passed to this component) */
    markNew: (entries: number[]) => void,
}

/**
 * The data list component is used to display the stored list of matches that can be selected for deletion, marking as scanned, or marking as new.
 * The selected matches are handled in this component and the actions are passed back to the parent component.
 * 
 * @param DataListProps
 * @returns An mui Table of matches that can be selected, deleted, and marked as scanned or new
 */
export default function DataList({ entries, readEntries, deleteItems, markRead, markNew }: DataListProps) {

    const [selected, setSelected] = useState<number[]>([]);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useLocalStorageState(10, "dataPageSize");

    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleSelectAll = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelected(entries?.map(e=>e.id) || []);
        } else {
            setSelected([]);
        }
    }

    const handleSelect = (match: number) => {
        if (!selected.includes(match)) {
            setSelected([...selected, match]);
        } else {
            setSelected(selected.filter(m => m !== match));
        }
    }

    const handlePageChange = (_e: unknown, newPage: number) => {
        setPage(newPage);
    }

    const handlePageSizeChange = (event: ChangeEvent<HTMLInputElement>) => {
        setPageSize(parseInt(event.target.value));
        setPage(0);
    }

    const handleDelete = () => {
        deleteItems(selected);
        setSelected([]);
        setConfirmDelete(false);
    }

    const handleMarkRead = () => {
        markRead(selected);
        setSelected([]);
    }

    const handleMarkNew = () => {
        markNew(selected);
        setSelected([]);
    }

    // Util stuff

    const isSelected = (match: number) => {
        return selected.includes(match);
    }
    const isScanned = (match: number) => {
        return readEntries.includes(match);
    }

    const visibleEntries = useMemo(()=>
        entries?.map(m=>m.id).slice(page * pageSize, (page + 1) * pageSize) || []
    , [entries, page, pageSize]);

    const emptyRows = Math.max(0, (1 + page) * pageSize - (entries?.length||0));

    if (entries===undefined) {
        return <CircularProgress color="inherit" />
    }
    return (
        <>
        <Paper className="w-full text-left">
            <Toolbar
                sx={{
                    pl: { sm: 2 },
                    pr: { xs: 1, sm: 1 },
                    ...(selected.length > 0 && {
                    bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
                    }),
                }}
            >
                {selected.length > 0 ? (
                    <Typography
                        sx={{ flex: '1 1 100%' }}
                        color="inherit"
                        variant="subtitle1"
                        component="div"
                    >
                        {selected.length} selected
                    </Typography>
                ) : (
                    <Typography
                        sx={{ flex: '1 1 100%' }}
                        variant="h6"
                        id="tableTitle"
                        component="div"
                    >
                        Saves Matches
                    </Typography>
                )}
                {selected.length > 0 ? (
                    <>
                        <Tooltip title="Mark as already scanned">
                            <IconButton onClick={handleMarkRead}>
                                <span className="material-symbols-outlined">mark_email_read</span>
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Mark as new">
                            <IconButton onClick={handleMarkNew}>
                                <span className="material-symbols-outlined">mark_email_unread</span>
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                            <IconButton onClick={()=>setConfirmDelete(true)}>
                                <span className="material-symbols-outlined text-red-400">delete</span>
                            </IconButton>
                        </Tooltip>
                    </>
                ) : ''}
                </Toolbar>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    indeterminate={selected.length > 0 && selected.length < entries.length}
                                    checked={entries.length > 0 && selected.length === entries.length}
                                    onChange={handleSelectAll}
                                />
                            </TableCell>
                            <TableCell padding="checkbox">Status</TableCell>
                            <TableCell>Match ID</TableCell>
                            <TableCell>Team #</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {visibleEntries.map((entryId) => {
                            const isItemSelected = isSelected(entryId);
                            const isItemScanned = isScanned(entryId);
                            return (
                                <TableRow
                                    onClick={() => handleSelect(entryId)}
                                    role="checkbox"
                                    aria-checked={isItemSelected}
                                    tabIndex={-1}
                                    key={entryId}
                                    selected={isItemSelected}
                                    {...(!isItemScanned && { sx: { bgcolor: (theme) => theme.palette.action.hover }})}
                                >
                                    <TableCell padding="checkbox">
                                        <Checkbox checked={isItemSelected} />
                                    </TableCell>
                                    <TableCell padding="checkbox">
                                        {!isItemScanned ? (
                                            <span>New</span>
                                        ) : 
                                            ''
                                        }
                                    </TableCell>
                                    <TableCell>{entries.find(e=>e.id===entryId)?.matchId}</TableCell>
                                    <TableCell>{entries.find(e=>e.id===entryId)?.teamNumber}</TableCell>
                                </TableRow>
                            )
                        })}
                        {emptyRows > 0 && (
                            <TableRow style={{ height: 53 * emptyRows }}>
                                <TableCell colSpan={4} />
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={entries.length}
                rowsPerPage={pageSize}
                labelRowsPerPage="Per page"
                page={page}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handlePageSizeChange}
            />
        </Paper>
        {/* Confirm delete data popup */}
        <Dialog 
            open={confirmDelete} 
            onClose={()=>setConfirmDelete(false)}
            aria-labelledby="delete-dialog-title"
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle id="delete-dialog-title">Are you sure you would like to delete {selected.length} match{selected.length == 1 ? '' : 'es'}?</DialogTitle>
            <DialogContent>
                <div className="mt-4 text-secondary">This delete action cannot be undone</div>
            </DialogContent>
            <DialogActions>
                <Button color="inherit" size="large" onClick={()=>setConfirmDelete(false)}>Cancel</Button>
                <Button color="error" size="large" onClick={handleDelete} autoFocus>Delete</Button>
            </DialogActions>
        </Dialog>
        </>
    )
}