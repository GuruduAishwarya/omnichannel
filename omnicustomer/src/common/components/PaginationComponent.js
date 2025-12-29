import ReactPaginate from 'react-paginate';


export default function PaginationComponent(props) {
    const internalStyles = `
    .pagination {
        justify-content: flex-end; /* Align pagination buttons to the right within the container */
    }
`;
    return (
        <>
            <style>{internalStyles}</style>
            <ReactPaginate
                previousLabel={"Previous"}
                nextLabel={"Next"}
                breakLabel={"..."}
                breakClassName={"break-me"}
                pageCount={props.pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={props.handlePageClick}
                containerClassName={"pagination"}
                subContainerClassName={"pages pagination"}
                activeClassName={"active"}
                forcePage={props.selectedPage} // Set the selected page using forcePage
            />
        </>

    );
}

