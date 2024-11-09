"use client";
import React, { useContext } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Divider,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Pagination,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@nextui-org/react";
import { FaSearch, FaChevronDown, FaEllipsisV } from "react-icons/fa";
import { capitalize } from "../data/utils";
import { DataContext } from "../../context/DataContext";
import axios from "axios";
import { useRouter } from "next/navigation";

const orderColumns = [
  { name: "ID", uid: "id", sortable: true },
  { name: "NAME", uid: "name", sortable: true },
  { name: "SLOT NO", uid: "slotNo" },
  { name: "QUANTITY", uid: "quantity" },
  { name: "PRICE", uid: "price" },
  { name: "STATUS", uid: "status", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

const statusOptions = [
  { name: "Booked", uid: "booked" },
  { name: "Used", uid: "used" },
  { name: "Expired", uid: "expired" },
];

const statusColorMap = {
  booked: "warning",
  expired: "danger",
  used: "success",
};

const INITIAL_VISIBLE_COLUMNS = ["name", "status", "actions"];

export default function OrdersTable() {
  const { orders, setOrders } = useContext(DataContext);
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState(new Set(INITIAL_VISIBLE_COLUMNS));
  const [statusFilter, setStatusFilter] = React.useState(new Set()); // Changed to Set
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "createdAt",
    direction: "ascending",
  });
  const [page, setPage] = React.useState(1);
  const router = useRouter();

  const deleteOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await axios.delete(`/api/order/${orderId}`);
        // Refresh orders list
        // Implement refresh logic if needed
      } catch (error) {
        console.error("Failed to delete order", error);
      }
    }
  };

  const deleteSelectedOrders = async () => {
    if (window.confirm("Are you sure you want to delete all selected orders?")) {
      try {
        for (const orderId of selectedKeys) {
          await axios.delete(`/api/order/${orderId}`);
        }
        setSelectedKeys(new Set([]));
        // Refresh orders list
        // Implement refresh logic if needed
      } catch (error) {
        console.error("Failed to delete selected orders", error);
      }
    }
  };

  const onStatusChange = async (selectedStatus) => {
    const status = selectedStatus;
    try {
        
      for (const orderId of selectedKeys) {
        await axios.put(`/api/order/${orderId}`, { status });
      }
      alert("order updated successfully")
      setSelectedKeys(new Set([])); // Clear selected keys after status change
      // Refresh orders list
      // Implement refresh logic if needed
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const pages = Math.ceil(orders.length / rowsPerPage);
  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return orderColumns;
    return orderColumns.filter((column) => visibleColumns.has(column.uid));
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredOrders = [...orders];
    if (hasSearchFilter) {
      filteredOrders = filteredOrders.filter((order) =>
        order.name.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    if (statusFilter.size > 0) {
        filteredOrders = filteredOrders.filter((order) =>
          statusFilter.has(order.status.toLowerCase())
        );
      }
      return filteredOrders;
    
  }, [orders, filterValue, statusFilter]);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback((order, columnKey) => {
    const cellValue = order[columnKey];
    switch (columnKey) {
      case "name":
        return <span>{cellValue}</span>;
      case "status":
        return (
          <span className={`badge ${statusColorMap[cellValue]}`}>
            {capitalize(cellValue)}
          </span>
        );
        case "slotNo":
            return <span>{order.slotNos.join(", ")}</span>;
          case "price":
            return <span>${order.totalPrice.toFixed(2)}</span>;
      case "actions":
        return (
          <div className="relative flex justify-center items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly radius="full" size="sm" variant="light">
                  <FaEllipsisV className="text-default-400" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem onClick={() => router.push(`/order/view/${order._id}`)}>View</DropdownItem>
                <DropdownItem onClick={() => router.push(`/order/edit/${order._id}`)}>Edit</DropdownItem>
                <DropdownItem onClick={() => deleteOrder(order._id)}>Delete</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue;
    }
  }, [router]);

  const onRowsPerPageChange = React.useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = React.useCallback((value) => {
    setFilterValue(value);
    setPage(1);
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            classNames={{ base: "w-full sm:max-w-[44%]", inputWrapper: "border-1" }}
            placeholder="Search by name..."
            size="sm"
            startContent={<FaSearch className="text-default-300" />}
            value={filterValue}
            variant="bordered"
            onClear={() => setFilterValue("")}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  endContent={<FaChevronDown className="text-small" />}
                  size="sm"
                  variant="flat"
                >
                  Status
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Order Status"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={(keys) => setStatusFilter(new Set(keys))}
              >
                {statusOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {capitalize(status.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  endContent={<FaChevronDown className="text-small" />}
                  size="sm"
                  variant="flat"
                >
                  Columns
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={(keys) => setVisibleColumns(new Set(keys))}
              >
                {orderColumns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">Total {orders.length} orders</span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 font-bold"
              onChange={onRowsPerPageChange}
            >
              <option className="bg-background" value={5}>5</option>
              <option className="bg-background" value={10}>10</option>
              <option className="bg-background" value={15}>15</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [filterValue, visibleColumns, statusFilter, orders.length, onSearchChange, onRowsPerPageChange]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="flex justify-between items-center">
        <span className="text-default-400 text-small">Total {selectedKeys.size} selected</span>
        <span className="w-[40%]">
          <Pagination
            isCompact
            page={page}
            total={pages}
            onChange={setPage}
            showControls
            showShadow
            variant="shadow"
          />
        </span>
        <Popover>
          <PopoverTrigger>
            <Button size="sm" variant="flat">Actions</Button>
          </PopoverTrigger>
          <PopoverContent>
            <Button
              flat
              size="sm"
              color="error"
              onClick={deleteSelectedOrders}
            >
              Delete Selected
            </Button>
            <Divider />
            <Popover>
              <PopoverTrigger>
                <Button flat size="sm">Change Status</Button>
              </PopoverTrigger>
              <PopoverContent>
                <Dropdown>
                  <DropdownTrigger>
                    <Button flat size="sm">Select Status</Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    disallowEmptySelection
                    aria-label="Change Status"
                  >
                    {statusOptions.map((status) => (
                      <DropdownItem
                        key={status.uid}
                        className={`capitalize text-${status.uid}`}
                        color={statusColorMap[status.uid]}
                        onClick={() =>{console.log(status.name);onStatusChange(status.name)}}
                      >
                        {capitalize(status.name)}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </PopoverContent>
            </Popover>
          </PopoverContent>
        </Popover>
      </div>
    );
  }, [selectedKeys, page, pages, deleteSelectedOrders, onStatusChange]);

  const classNames = React.useMemo(
    () => ({
      wrapper: ["max-h-[382px]", "max-w-3xl"],
      th: ["bg-transparent", "text-default-500", "border-b", "border-divider"],
      td: [
        "group-data-[first=true]:first:before:rounded-none",
        "group-data-[first=true]:last:before:rounded-none",
        "group-data-[middle=true]:before:rounded-none",
        "group-data-[last=true]:first:before:rounded-none",
        "group-data-[last=true]:last:before:rounded-none",
      ],
    }),
    []
  );

  return (
    <Table
      isCompact
      removeWrapper
      aria-label="Orders table with custom cells, pagination and sorting"
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      checkboxesProps={{
        classNames: {
          wrapper: "after:bg-foreground after:text-background text-background",
        },
      }}
      classNames={classNames}
      selectedKeys={selectedKeys}
      selectionMode="multiple"
      sortDescriptor={sortDescriptor}
      topContent={topContent}
      topContentPlacement="outside"
      onSelectionChange={setSelectedKeys}
      onSortChange={setSortDescriptor}
    >
      <TableHeader columns={headerColumns}>
        {(column) => (
          <TableColumn
            key={column.uid}
            align={column.uid === "actions" ? "center" : "start"}
            allowsSorting={column.sortable}
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody emptyContent={"No orders found"} items={sortedItems}>
        {(order) => (
          <TableRow key={order._id}>
            {(columnKey) => <TableCell>{renderCell(order, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
