import React, { useEffect, useState } from 'react';
import PageTitle from '../../../common/PageTitle';
import PaginationComponent from "../../../common/components/PaginationComponent";
import { fetchOptoutLists } from '../../../utils/ApiClient';
import { triggerAlert } from '../../../utils/CommonFunctions';
import Loader from '../../../common/components/Loader';

export default function Optout() {
    const [isLoading, setIsLoading] = useState(false);
    const [optoutList, setOptoutList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [perPageLimit, setPerPageLimit] = useState(10);
    const [pageLimitSelected, setPageLimitSelected] = useState(10);

    const fetchOptoutList = async (page, searchKey = '') => {
        setIsLoading(true);
        try {
            const params = {
                page: page,
                page_size: perPageLimit,
                keyword: searchKey.toLowerCase()
            };
            const response = await fetchOptoutLists(params);
            const responseData = response.data;

            if (responseData.error_code === 200) {
                const data = Object.values(responseData.results.data);
                const totalPages = responseData.results.pagination.total_pages;
                setOptoutList(data);
                setTotalPages(totalPages);
            } else {
                setOptoutList([]);
                setTotalPages(0);
                triggerAlert('error', 'Oops...', 'Something went wrong.');
            }
        } catch (error) {
            triggerAlert('error', 'Oops...', error.response?.data?.message || "Something went wrong!");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOptoutList(currentPage, searchQuery);
    }, [currentPage, searchQuery, perPageLimit]);

    const handlePageClick = (selected) => {
        const selectedPage = selected.selected + 1;
        setCurrentPage(selectedPage);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
        setCurrentPage(1);
    };

    const handlePageChange = (event) => {
        const newLimit = Number(event.target.value);
        setPageLimitSelected(newLimit);
        setPerPageLimit(newLimit);
        setCurrentPage(1); // Reset to first page when page limit changes
    };

    return (
        <div id="content-page" className="content-page">
            <div className="container">
                <PageTitle heading="Opted Out Numbers" />
                <div className="row mb-5">
                    <div className="col-sm-12">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex justify-content-between mb-3">
                                    <div className="dataTables_length" id="example_length">
                                        <label>
                                            Show
                                            <select
                                                name="example_length"
                                                aria-controls="example"
                                                className="table_length"
                                                onChange={handlePageChange}
                                                value={pageLimitSelected}
                                            >
                                                <option value="10">10</option>
                                                <option value="20">20</option>
                                                <option value="50">50</option>
                                                <option value="100">100</option>
                                            </select>{" "}
                                            entries
                                        </label>
                                    </div>
                                    <div style={{ width: '20%' }}>
                                        <input
                                            type="search"
                                            placeholder="Search..."
                                            value={searchQuery}
                                            className="form-control form-control-sm"
                                            aria-controls="example"
                                            onChange={handleSearchChange}
                                        />
                                    </div>
                                </div>
                                <div className="table-responsive">
                                    {isLoading ? (
                                        <div className="loader-overlay text-white">
                                            <Loader />
                                        </div>
                                    ) : (
                                        <table className="table table-bordered display" style={{ width: "100%" }}>
                                            <thead>
                                                <tr>
                                                    <th>Sl.No</th>
                                                    <th>Number</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {optoutList.length > 0 ? (
                                                    optoutList.map((item, index) => (
                                                        <tr key={index}>
                                                            <th scope="row">{(currentPage - 1) * perPageLimit + index + 1}</th>
                                                            <td>{item.contact_number}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="2" className="text-center">There is no data</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    )}
                                    <PaginationComponent
                                        pageCount={totalPages}
                                        handlePageClick={handlePageClick}
                                        selectedPage={currentPage - 1}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
