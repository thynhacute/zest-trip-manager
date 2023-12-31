import { useState, useEffect, useContext } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import { Backdrop, CircularProgress } from '@mui/material';
import TablePagination from '@mui/material/TablePagination';

import { generateRowsPerPageOptions } from 'src/utils/generate-rows-per-page';

import { users } from 'src/_mock/user';
import { DataContext } from 'src/store/datacontext/DataContext';
// eslint-disable-next-line import/no-named-as-default
import axiosInstance, { BASE_URL } from 'src/store/apiInterceptors';

import Scrollbar from 'src/components/scrollbar';

import TableNoData from './table-no-data';
import UserTableRow from './user-table-row';
import UserTableHead from './user-table-head';
import TableEmptyRows from './table-empty-rows';
import UserTableToolbar from './user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from './utils';

// ----------------------------------------------------------------------

export default function ListReview() {
  const { loadingAccProvider } = useContext(DataContext);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [data, setData] = useState({ data: [] });
  console.log(data);
  const rowsPerPageOptions = generateRowsPerPageOptions(data?.data?.length);
  const [loading, setLoading] = useState(false);

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = users.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const dataFiltered = applyFilter({
    inputData: data?.data,
    comparator: getComparator(order, orderBy),
    filterName,
  });
  const notFound = !dataFiltered.length && !!filterName;

  useEffect(() => {
    const queryParams = {};

    axiosInstance
      .get(`${BASE_URL}/staff/review`, {
        params: queryParams,
      })
      .then((response) => {
        setData(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error:', error);
        setLoading(false);
      });
  }, [loadingAccProvider]);

  return (
    <Container>
      <Backdrop
        // eslint-disable-next-line no-shadow
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
        onClick={() => setLoading(false)}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Review</Typography>
      </Stack>

      <Card>
        <UserTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHead
                order={order}
                orderBy={orderBy}
                rowCount={users.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                onSelectAllClick={handleSelectAllClick}
                headLabel={[
                  { id: 'name', label: 'Reviewer' },
                  { id: 'company', label: 'Content' },
                  { id: 'role', label: 'Rating' },
                  { id: 'isVerified', label: 'Reply', align: 'center' },
                  { id: 'status', label: 'Status' },
                  { id: '' },
                ]}
              />
              <TableBody>
                {dataFiltered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  ?.map((row) => (
                    <UserTableRow
                      key={row.id}
                      name={row.ReviewReplies?.user?.email}
                      role={row?.rating}
                      status={row.status}
                      company={row.content}
                      avatarUrl={row.avatar_image_url}
                      isVerified={row.ReviewReplies}
                      selected={selected.indexOf(row.name) !== -1}
                      handleClick={(event) => handleClick(event, row.name)}
                      idProvider={row.id}
                      data={row}
                    />
                  ))}

                <TableEmptyRows
                  height={77}
                  emptyRows={emptyRows(page, rowsPerPage, users.length)}
                />

                {notFound && <TableNoData query={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          page={page}
          component="div"
          count={data?.total}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={rowsPerPageOptions}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Container>
  );
}
