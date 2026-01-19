import { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Paginator } from "primereact/paginator";

type Pagination = {
  total: number;
  limit: number;
  current_page: number;
};

interface Art {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

interface ApiResponse {
  data: Art[];
  pagination: Pagination;
}

const fetchArts = async (page: number): Promise<ApiResponse> => {
  const res = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}`);
  return res.json();
};

const ArtWork = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const [showModal, setShowModal] = useState(false);
  const [selectCount, setSelectCount] = useState<number>(0);

  const page = Number(searchParams.get("page")) || 1;
  const { data, isLoading, error } = useQuery<ApiResponse, Error>({
    queryKey: ["arts", page],
    queryFn: () => fetchArts(page),
    // keepPreviousData: true,
  });

  const handleBulkSelect = async () => {
    if (selectCount <= 0) return;

    const res = await fetch(
      `https://api.artic.edu/api/v1/artworks?limit=${selectCount}`,
    );
    const json = await res.json();

    setSelectedIds((prev) => {
      const next = new Set(prev);
      json.data.forEach((art: Art) => next.add(art.id));
      return next;
    });

    setShowModal(false);
  };

  if (isLoading) return <h3>Loading...</h3>;
  if (error) return <h3>Error occurred</h3>;

  //   console.log(selectedRows);

  if (!data) return <h1>NO RESPONSE</h1>;

  return (
    <div className="">
      <div className="flex gap-1 m-4 items-center">
        <div className="text-md text-gray-800">
          Selected: <span className="text-blue-600">{selectedIds.size}</span>{" "}
          rows
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="text-xl text-gray-700 hover:text-gray-900 cursor-pointer"
          title="Select rows"
        >
          ▾
        </button>
      </div>

      <DataTable
        value={data.data}
        lazy
        paginator={false}
        // first={(page - 1) * data.pagination.limit}
        rows={data.pagination.limit ?? 12}
        totalRecords={data.pagination.total}
        selection={data.data.filter((row) => selectedIds.has(row.id))}
        onSelectionChange={(e) => {
          const selectedRows = e.value as Art[];

          setSelectedIds((prev) => {
            const next = new Set(prev);

            // 1️⃣ Add selected rows
            selectedRows.forEach((row) => {
              next.add(row.id);
            });

            // 2️⃣ Remove unselected rows from CURRENT PAGE ONLY
            data.data.forEach((row) => {
              const stillSelected = selectedRows.some(
                (selected) => selected.id === row.id,
              );

              if (!stillSelected) {
                next.delete(row.id);
              }
            });

            return next;
          });
        }}
        selectionMode="multiple"
        dataKey="id"
        className="text-sm"
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
        <Column field="title" header="TITLE"></Column>
        <Column field="place_of_origin" header="PLACE OF ORIGIN"></Column>
        <Column field="artist_display" header="ARTIST"></Column>
        <Column field="inscriptions" header="INSCRIPTIONS"></Column>
        <Column field="date_start" header="START DATE"></Column>
        <Column field="date_end" header="END DATE"></Column>
      </DataTable>

      <div className="flex items-center justify-between px-4 py-4">
        <p className="text-sm text-gray-600 font-medium">
          Showing{" "}
          <span className="font-bold">
            {(page - 1) * data.pagination.limit + 1}
          </span>{" "}
          to{" "}
          <span className="font-bold">
            {(page - 1) * data.pagination.limit + data.pagination.limit}
          </span>{" "}
          of <span className="font-bold">{data.pagination.total}</span> entries
        </p>
        <Paginator
          first={(page - 1) * data.pagination.limit}
          rows={data.pagination.limit}
          totalRecords={data.pagination.total}
          onPageChange={(e) => {
            const nextPage = (e.page ?? 0) + 1;
            setSearchParams({ page: String(nextPage) });
          }}
        />
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h3 className="font-semibold text-lg mb-2">Select Multiple Rows</h3>
            <p className="text-sm text-gray-500 mb-4">
              Enter number of rows to select across all pages
            </p>

            <input
              type="number"
              className="w-full border rounded px-3 py-2 mb-4"
              placeholder="e.g. 20"
              value={selectCount}
              onChange={(e) => setSelectCount(Number(e.target.value))}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600"
              >
                Cancel
              </button>

              <button
                onClick={() => handleBulkSelect()}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Select
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtWork;
