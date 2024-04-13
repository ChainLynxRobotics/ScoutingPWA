import { useState, ChangeEvent, useMemo } from "react";
import { MatchIdentifier } from "../types/MatchData";
import { Checkbox, CircularProgress, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Toolbar, Tooltip, Typography } from "@mui/material";
import { alpha } from '@mui/material/styles';

interface DataListProps {
    matches: MatchIdentifier[]|undefined, 
    setMatches: (matches: MatchIdentifier[]|undefined) => void, 
    scanned: MatchIdentifier[], 
    setScanned: (scanned: MatchIdentifier[]) => void 
}

export default function DataList({ matches, setMatches, scanned, setScanned }: DataListProps) {

    const [selected, setSelected] = useState<MatchIdentifier[]>([]);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const handleSelectAll = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelected(matches || []);
        } else {
            setSelected([]);
        }
    }

    const handleSelect = (match: MatchIdentifier) => {
        if (!selected.some(m => match.matchId === m.matchId && match.teamNumber === m.teamNumber)) {
            setSelected([...selected, match]);
        } else {
            setSelected(selected.filter(m => match.matchId !== m.matchId || match.teamNumber !== m.teamNumber));
        }
    }

    const handlePageChange = (_e: unknown, newPage: number) => {
        setPage(newPage);
    }

    const handlePageSizeChange = (event: ChangeEvent<HTMLInputElement>) => {
        setPageSize(parseInt(event.target.value));
        setPage(0);
    }

    const isSelected = (match: MatchIdentifier) => {
        return selected.some(m => match.matchId === m.matchId && match.teamNumber === m.teamNumber);
    }
    const isScanned = (match: MatchIdentifier) => {
        return scanned.some(m => match.matchId === m.matchId && match.teamNumber === m.teamNumber);
    }


    const visibleMatches = useMemo(()=>
        matches?.slice(page * pageSize, (page + 1) * pageSize) || []
    , [matches, page, pageSize]);

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * pageSize - (matches?.length||0)) : 0;

    if (!matches) {
        return <CircularProgress color="inherit" />
    }
    return (
        <>
        <Paper sx={{ width: '100%', mb: 2 }}>
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
                        <Tooltip title="Delete">
                            <IconButton>
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
                                    indeterminate={selected.length > 0 && selected.length < matches.length}
                                    checked={matches.length > 0 && selected.length === matches.length}
                                    onChange={handleSelectAll}
                                />
                            </TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Match ID</TableCell>
                            <TableCell>Team Number</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {visibleMatches.map((match) => {
                            const isItemSelected = isSelected(match);
                            const isItemScanned = isScanned(match);
                            return (
                                <TableRow
                                    onClick={() => handleSelect(match)}
                                    role="checkbox"
                                    aria-checked={isItemSelected}
                                    tabIndex={-1}
                                    key={match.matchId + match.teamNumber}
                                    selected={isItemSelected}
                                    {...(!isItemScanned && { sx: { bgcolor: (theme) => theme.palette.action.hover }})}
                                >
                                    <TableCell padding="checkbox">
                                        <Checkbox checked={isItemSelected} />
                                    </TableCell>
                                    <TableCell>
                                        {!isItemScanned ? (
                                            <b>New</b>
                                        ) : 
                                            ''
                                        }
                                    </TableCell>
                                    <TableCell>{match.matchId}</TableCell>
                                    <TableCell>{match.teamNumber}</TableCell>
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
                count={matches.length}
                rowsPerPage={pageSize}
                page={page}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handlePageSizeChange}
            />
        </Paper>
        </>
    )
}