import React, { useEffect, useState } from 'react'
import PageTitle from '../../../common/PageTitle'
import { useForm } from 'react-hook-form';
import { ConfirmationAlert, pageReload, simpleAlert, transformText, triggerAlert } from '../../../utils/CommonFunctions';
import PaginationComponent from '../../../common/components/PaginationComponent';
import Loader from '../../../common/components/Loader';
import { getLocalDidList, getRateCenterList, getStateList, orderDid } from '../../../utils/ApiClient';
import { useNavigate } from "react-router-dom";

export default function OrderNumbers() {
    const navigate = useNavigate();
    //////////////////////////////////////// Form ////////////////////////////////////////////////
    const { register, handleSubmit, formState: { errors }, setValue, reset, watch } = useForm();

    ////////////////////////////////////// States /////////////////////////////////////////////
    const [data, setData] = useState([]);
    // const [routes, setRoutes] = useState([]);
    const [isLoading, setIsLoading] = useState();
    const [rateCenterData, setRateCenterData] = useState([]);
    const [orderlist, setOrderlist] = useState([]);
    const [orderDidRate, setOrderDidRate] = useState([]);
    const [selectedTab, setSelectedTab] = useState("local");
    const [selectedCountry, setSelectedCountry] = useState('');
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [isButtollDisabled, setIsButtollDisabled] = useState(true);
    const [selectedCheckboxes, setSelectedCheckboxes] = useState({});
    const [showTable, setShowTable] = useState(false);
    const [showOrderDidPage, setShowOrderDidPage] = useState(true);
    const [showOrderConfirmed, setShowOrderConfirmed] = useState(false);
    const [orderedDids, setOrderedDids] = useState([]);

    const [formData, setFormData] = useState({
        searchselect: '',
        stateselect: '',
        ratecenter: '',
        npanxxx: ''
    });

    const [currentPage, setCurrentPage] = useState(0);
    const [pageCount, setPageCount] = useState(0);
    const [pageSlNo, setPageSlNo] = useState(0);
    const [perPageLimit, setPerPageLimit] = useState(50);
    const [sessKey, setSessKey] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const types = selectedTab;

    /////////////////////////////////////// handle functions //////////////////////////////////////
    const handleDropdownChange = (event) => {
        const selectedValue = event.target.value;
        setSelectedCountry(selectedValue);
        setValue('state', '');
        setValue('stateselect', '');
        setValue('rateCenterSelect', '');
        setIsButtonDisabled(true);
        setOrderlist([]);
        setSessKey('');
        setPageCount(0);
        setSearchQuery('');
        setCurrentPage(0);
        setSelectedCheckboxes({});
    };

    const stateselection = (event) => {
        setValue('rateCenterSelect', '');
        setIsButtonDisabled(true);
        setOrderlist([]);
        setSessKey('');
        setPageCount(0);
        setSearchQuery('');
        setCurrentPage(0);
        setSelectedCheckboxes({});
        if (event.target.value) {
            fetchRateCenterData(event.target.value);
        } else {
            setIsButtonDisabled(true);
        }
    };

    const rateCenterSelection = (event) => {
        setOrderlist([]);
        setSessKey('');
        setPageCount(0);
        setSearchQuery('');
        setCurrentPage(0);
        setSelectedCheckboxes({})

        const stateselect = event.target.value;

        if (stateselect === '') setIsButtonDisabled(true);
        else setIsButtonDisabled(false);

    };

    const areaselection = (event) => {
        setOrderlist([]);
        setSessKey('');
        setPageCount(0);
        setSearchQuery('');
        setCurrentPage(0);
        setSelectedCheckboxes({})

        const codes = event.target.value;
        if (codes === '') {
            setIsButtonDisabled(true);
        }
        else {
            setIsButtonDisabled(false);
        }
    };

    const npaselection = (event) => {
        setOrderlist([]);
        setSessKey('');
        setPageCount(0);
        setSearchQuery('');
        setCurrentPage(0);
        setSelectedCheckboxes({})

        const npa = event.target.value;
        if (npa === '') {
            setIsButtonDisabled(true);
        }
        // else {
        //     setIsButtonDisabled(false);
        // }
    };

    const npxselection = (event) => {
        setOrderlist([]);

        setSessKey('');
        setPageCount(0);
        setSearchQuery('');
        setCurrentPage(0);
        setSelectedCheckboxes({})

        const nxx = event.target.value;
        if (nxx === '') {
            setIsButtonDisabled(true);
        }
        else {
            setIsButtonDisabled(false);
        }
    };

    const handleClearClick = () => {

        setSelectedCheckboxes({});
    };

    ////////////////////// APi calls for selects/////////////////////////

    const fetchStateData = async () => {
        setIsLoading(true);
        try {
            const response = await getStateList();
            const response_data = response.data;
            if (response_data.error_code === 200) {
                const itemsArray = Object.values(response_data.results);
                setData(itemsArray);
            } else {
                setData([]);
                triggerAlert('error', 'Oops...', 'Something went wrong..');
            }
        } catch (error) {
            setData([]);
            triggerAlert('error', 'Oops...', 'Something went wrong..');
        } finally {
            setIsLoading(false);
        }
    };


    const fetchRateCenterData = async (stateSelected) => {
        setIsLoading(true);
        const api_input = {
            state: stateSelected
        };
        try {
            const response = await getRateCenterList(api_input);
            const response_data = response.data;
            if (response_data.error_code === 200) {
                const itemsArray = Object.values(response_data.results);
                setRateCenterData(itemsArray);
            } else {
                triggerAlert('error', 'Oops...', 'Something went wrong..');
            }
        } catch (error) {
            triggerAlert('error', 'Oops...', 'Something went wrong..');
        } finally {
            setIsLoading(false);
        }
    };

    ////////////////////////////////checkbox func////////////////////////////////////////
    const handleCheckboxChange = (event, number, provider) => {
        const isChecked = event.target.checked;

        setSelectedCheckboxes((prevState) => {
            // Create a copy of the previous state
            const updatedState = { ...prevState };

            // If checkbox is checked, add it to the state
            if (isChecked) {
                updatedState[number] = {
                    number: number,
                    provider: provider,
                    isChecked: true,
                };
            } else {
                // If checkbox is unchecked, remove it from the state
                delete updatedState[number];
            }

            // Return the updated state
            return updatedState;
        });

    }

    const handleCheckAllChange = (event) => {
        const isChecked = event.target.checked;
        const newSelectedCheckboxes = {};
        if (isChecked) {
            orderlist.forEach((row) => {
                newSelectedCheckboxes[row.number] = {
                    number: row.number,
                    provider: row.provider,
                    isChecked: true,
                };
            });
        }

        setSelectedCheckboxes(newSelectedCheckboxes);
    };

    /////////////////////////////////for bulk order button//////////////////////////////////
    const handleBulkOrderClick = () => {
        // setSelectedCheckboxes({});
        const selectedCheckboxesKeys = Object.keys(selectedCheckboxes);

        if (selectedCheckboxesKeys.length > 0) {
            setShowOrderDidPage(!showOrderDidPage); //hide OrderDidPage

        } else {
            simpleAlert('Please select a DID');
            setShowOrderDidPage(showOrderDidPage);
        }

    };

    /////////////////////////// Order Local DID //////////////////////////////
    const serviceSearch = async (data, page, searchkey) => {
        setPerPageLimit(perPageLimit);
        setShowTable(true);
        setIsLoading(true);
        const per_page = perPageLimit;
        try {
            setPageSlNo((page - 1) * per_page);
            let datas = {
                type: data.searchselect,
                sess_key: sessKey,
                page: page,
                per_page: per_page,
                search_number: searchkey ? searchkey : ''
            };
            switch (data.searchselect) {
                case 'areacode':
                    datas.areacode = data.ratecenter;
                    break;
                case 'state':
                    datas.state = data.stateselect;
                    datas.rate_center = data.rateCenterSelect;
                    break;
                case 'npanxxx':
                    datas.areacode = data.npa;
                    datas.npanxxx = data.nxx;
                    break;
                default:
                    triggerAlert('error', 'Oops...', 'Something went wrong..');
                    setIsLoading(false);
                    return;
            }
            const response = await getLocalDidList(datas);
            const response_data = response.data;
            if (response_data.error_code === 200) {
                const total_pages = response_data.results.pagination.total_pages;
                setPageCount(total_pages);
                const orderArray = Object.values(response_data.results.data);
                setOrderlist(orderArray);
                setOrderDidRate(response_data.results.user_rate_data);
                setSessKey(response_data.results.sess_key);
            } else {
                triggerAlert('error', 'Oops...', 'Something went wrong..');
            }
        } catch (error) {
            const response_data = error?.response?.data;
            if (response_data?.error_code === 400) {
                triggerAlert('error', ' ', response_data?.message);
            } else {
                triggerAlert('error', ' ', response_data ? response_data.message : "Only numbers are accepted!");
            }
        } finally {
            setIsLoading(false);
        }
    };




    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        const searchkey = e.target.value;
        setCurrentPage(0);
        switch (types) {
            case 'local':
                serviceSearch(formData, 1, searchkey);
                break;
            default:
                break;
        }
    };

    const onFilterSubmit = (data) => {
        setFormData(data);
        switch (types) {
            case 'local':
                serviceSearch(data, currentPage + 1);
                break;
            default:
                break;
        }
    };
    /////////////////////////for ordering numbers after confirmation///////////////////////////////
    const handleOrderConfirming = async () => {
        const selectedValues = Object.values(selectedCheckboxes).filter(
            (checkbox) => checkbox.isChecked
        );

        const datasArray = [];
        const insert_order = {
            line_type: types,
            selected_did: []
        };
        for (const value of selectedValues) {
            // Perform an action for each selected value
            const datas = {
                tn: value['number'],
                provider: value['provider'],
            }
            datasArray.push(datas);
        }
        insert_order['selected_did'] = datasArray;

        setIsLoading(true);
        try {
            const response = await orderDid(insert_order);
            // const response = await axios.post(api_url + 'services/order_did_mail', insert_order, token);

            const response_data = response.data;
            setIsLoading(false);
            if (response_data.error_code === 200) {
                setSelectedCheckboxes({});

                const OrderedNumbers = response_data.results;
                setOrderedDids(OrderedNumbers);
                setShowOrderConfirmed(true);

                // Call Routes API and store the response data in routes state
                // try {
                //     const api_input = {
                //         u: "admin",
                //         user_id: 885
                //     };
                //     const routesResponse = await axios.post(api_url + `switches/list/`, api_input);
                //     const routesData = routesResponse.data;
                //     console.log('routeData', routesData)
                //     if (routesData.error_code === 200) {
                //         // Assuming routesData.results contains the routes array
                //         console.log('rotesIP', routesData.results.page.devices.device.ipaddr)
                //         const itemsArray = Object.values(routesData.results.page.devices.device);

                //         setRoutes(itemsArray);
                //     } else {
                //         // Handle error if necessary
                //         triggerAlert('error', 'Oops...', 'Unable to get Routes..');
                //     }
                // } catch (routesError) {
                //     // Handle error if necessary
                //     triggerAlert('error', 'Oops...', 'Something went wrong..');
                // }
                // triggerAlert('succees', 'Success', "Successfully ordered the number.");
            } else {
                setSelectedCheckboxes({});
                triggerAlert('error', 'Oops...', 'Something went wrong..');
            }

        } catch (error) {
            const errors = error?.response;
            const errors_message = errors?.data?.message;
            // setShowOrderConfirmed(false);

            setSelectedCheckboxes({});
            setShowOrderDidPage(true)
            setIsLoading(false);
            triggerAlert('error', 'Oops...', errors_message);
        }

    }


    /////////////////////////// Pagination ////////////////////////////////////
    const handlePageClick = (selected) => {

        const selectedPage = selected.selected;

        setCurrentPage(selectedPage);

        switch (types) {
            case 'local':
                serviceSearch(formData, selectedPage + 1);// Increment the page number by 1 for server-side pagination
                break;
            // case 'toll_free':
            //     tollfreeSearch(formData, selectedPage + 1);// Increment the page number by 1 for server-side pagination
            //     break;
            // case 'vfax':
            //     vfaxSearch(formData, selectedPage + 1);
            //     break;
            // case 'international':
            //     serviceSearch(data, currentPage + 1);
            //     break;

            default:
                break;
        }
    };
    let pgntn_props = {
        pageCount: pageCount,
        handlePageClick: handlePageClick,
        selectedPage: currentPage
    }

    useEffect(() => {
        setCurrentPage(0);
        fetchStateData();  // Fetch data for the initial page
    }, []);

    //back func from OrderConfirm
    const handleOrderConfmBack = () => {
        pageReload();
    }
    return (
        <main class="main-content mt-3">

            <div class="container content-inner  " id="page_layout">

                <PageTitle heading="Order Numbers" showPrimaryButton={"My Numbers"} onPrimaryClick={() => {
                    navigate('/sms/my_number')
                }} />
                {showOrderDidPage && (
                    <>
                        <div class="row">
                            <div class="col-sm-12">
                                <div class="card p-3">
                                    <h5 class="mb-3 mt-3">Please select the state and ratecenters to view the Numbers.
                                    </h5>
                                    <div class="row mb-3">
                                        <div class="col-lg-12">
                                            <form onSubmit={handleSubmit(onFilterSubmit)}>
                                                <div data-repeater-list="group-a">
                                                    <div data-repeater-item="" className="row">
                                                        <div className="mb-3 col-lg-3">
                                                            <div className="mb-3 row">
                                                                <label className="col-form-label">Select option:</label>
                                                                <div className="col-md-12">
                                                                    <select
                                                                        className="form-select"
                                                                        name="searchselect"
                                                                        {...register('searchselect')}
                                                                        onChange={handleDropdownChange}
                                                                        aria-label="Default select example"
                                                                    >
                                                                        <option value="" hidden>Select</option>
                                                                        <option value="state">Search By State</option>
                                                                        <option value="areacode">Search By AreaCode</option>
                                                                        <option value="npanxxx">Search By NPANXX</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {selectedCountry === 'state' && (
                                                            <>
                                                                <div className="mb-3 col-lg-3">
                                                                    <div className="mb-3 row">
                                                                        <label className="col-form-label">State:</label>
                                                                        <div className="col-md-12">
                                                                            <select
                                                                                className="form-select"
                                                                                name="stateselect"
                                                                                {...register('stateselect')}
                                                                                onChange={stateselection}
                                                                                aria-label="Default select example"
                                                                            >
                                                                                <option value="" hidden>Select State</option>
                                                                                {data?.map((item, index) => (
                                                                                    <option key={index} value={item}>
                                                                                        {item}
                                                                                    </option>
                                                                                ))}
                                                                            </select>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="mb-3 col-lg-3">
                                                                    <div className="mb-3 row">
                                                                        <label className="col-form-label">Rate Center:</label>
                                                                        <div className="col-md-12">
                                                                            <select
                                                                                className="form-select"
                                                                                name="rateCenterSelect"
                                                                                {...register('rateCenterSelect')}
                                                                                onChange={rateCenterSelection}
                                                                                aria-label="Default select example"
                                                                            >
                                                                                <option value="" hidden>Select Rate Center</option>
                                                                                {rateCenterData?.map((item, index) => (
                                                                                    <option key={index} value={item}>
                                                                                        {item}
                                                                                    </option>
                                                                                ))}
                                                                            </select>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                        {selectedCountry === 'areacode' && (
                                                            <div className="mb-3 col-lg-3">
                                                                <div className="mb-3 row">
                                                                    <label className="col-form-label">Enter Area Code:</label>
                                                                    <div className="col-md-12">
                                                                        <input
                                                                            name="ratecenter"
                                                                            className="form-control"
                                                                            {...register('ratecenter')}
                                                                            onChange={areaselection}
                                                                            placeholder="Enter Area Code"
                                                                            type="text"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {selectedCountry === 'npanxxx' && (
                                                            <>
                                                                <div className="mb-3 col-lg-3">
                                                                    <div className="mb-3 row">
                                                                        <label className="col-form-label">Enter NPA:</label>
                                                                        <div className="col-md-12">
                                                                            <input
                                                                                name="npa"
                                                                                className="form-control"
                                                                                {...register('npa')}
                                                                                onChange={npaselection}
                                                                                placeholder="Enter NPA"
                                                                                type="text"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="mb-3 col-lg-3">
                                                                    <div className="mb-3 row">
                                                                        <label className="col-form-label">Enter NXX:</label>
                                                                        <div className="col-md-12">
                                                                            <input
                                                                                name="nxx"
                                                                                className="form-control"
                                                                                {...register('nxx')}
                                                                                onChange={npxselection}
                                                                                placeholder="Enter NXX"
                                                                                type="text"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                        <div className="col-lg-3">
                                                            <label className="col-form-label fw-bold">&nbsp;</label>
                                                            <div>
                                                                <button
                                                                    type="submit"
                                                                    disabled={isButtonDisabled}
                                                                    className="btn btn-info rounded-pill mb-3 me-1"
                                                                >
                                                                    Search
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>

                                        {/* <div class="col-lg-6">
                                        <button type="button" class="btn btn-success rounded-pill mb-3 me-1">Apply Now</button>
                                        <button type="button" class="btn btn-info rounded-pill mb-3 me-1">Export</button>
                                        <button type="button" class="btn btn-light rounded-pill mb-3 me-1">Last 7 days</button>
                                        <button type="button" class="btn btn-light rounded-pill mb-3 me-1">Last 30 days</button>
                                        <button type="button" class="btn btn-light rounded-pill mb-3 me-1">This year</button>
                                    </div> */}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-sm-12">
                                {showTable && (
                                    <div className="card">
                                        <div className="card-body">
                                            {orderlist.length > 0 ? (
                                                <div
                                                    className="d-grid gap-2 d-md-flex justify-content-sm-end mb-4">
                                                    {Object.keys(selectedCheckboxes)?.length > 0 &&
                                                        <button
                                                            className="btn btn-warning rounded-pill mb-3 me-1 px-5"
                                                            type="button" onClick={handleClearClick}>Cancel</button>}
                                                    <button
                                                        className="btn btn-success rounded-pill mb-3 me-1 px-5"
                                                        type="button" onClick={handleBulkOrderClick}>Order</button>
                                                </div>
                                            ) : null}
                                            <>
                                                {/* Pagination */}
                                                <div className='d-flex justify-content-end mb-2'>
                                                    <div className="btn-group ">
                                                        <input type="search" placeholder="Search..." value={searchQuery} class="form-control form-control-sm" aria-controls="example" onChange={handleSearchChange} />
                                                        &nbsp;&nbsp;
                                                        {/* <input type="text" placeholder="Search..." value={searchQuery} onChange={handleChange}  />  */}
                                                    </div>
                                                    {/* <div className="dataTables_length" id="example_length">
                                                                        <label>Show
                                                                            <select name="example_length" aria-controls="example" className="table_length" onChange={handlePageChange} value={pageLimitSelected}>
                                                                                <option value="25">25</option>
                                                                                <option value="50">50</option>
                                                                                <option value="75">75</option>
                                                                                <option value="100">100</option>
                                                                            </select> entries
                                                                        </label>
                                                                    </div> */}

                                                </div>

                                                <div className="table-responsive">

                                                    <table className="table table-bordered  mb-0" >
                                                        <thead >
                                                            <tr >
                                                                <th style={{ padding: '0.3rem 0.3rem' }}>
                                                                    <div className="form-check ">
                                                                        <input className="form-check-input"
                                                                            type="checkbox" value=""
                                                                            id="flexCheckDefault" checked={Object.keys(selectedCheckboxes).length > 0 ? Object.keys(selectedCheckboxes).length === orderlist.length : false}
                                                                            onChange={handleCheckAllChange} />
                                                                    </div>
                                                                </th>
                                                                <th style={{ padding: '0.2rem 0.2rem' }}>Available {transformText(types, 'capitalize')} DIDs</th>
                                                                <th style={{ padding: '0.2rem 0.2rem' }}>MRC</th>
                                                                <th style={{ padding: '0.2rem 0.2rem' }}>Set Up Fee</th>
                                                                {/* <th style={{ padding: '0.2rem 0.2rem' }}>Per Minute Fee</th> */}
                                                                {/* <th style={{ padding: '0.2rem 0.2rem' }}>Order</th> */}
                                                            </tr>
                                                        </thead>
                                                        {isLoading ? (
                                                            <div className='loader-overlay text-white'>
                                                                <Loader />
                                                            </div>

                                                        ) : (
                                                            <tbody>
                                                                {orderlist.length === 0 ? (
                                                                    <tr>
                                                                        <td colSpan="6" className="text-center">No data available</td>
                                                                    </tr>
                                                                ) : (
                                                                    orderlist?.map((did, index) => (
                                                                        <tr key={did.number}>
                                                                            <th scope="row" style={{ padding: '0.3rem 0.3rem' }}>
                                                                                <div className="form-check">
                                                                                    <input
                                                                                        className="form-check-input"
                                                                                        type="checkbox"
                                                                                        value=""
                                                                                        id={`flexCheckDefault${did.number}`}
                                                                                        checked={selectedCheckboxes[did.number]?.isChecked || false}
                                                                                        onChange={(e) => handleCheckboxChange(e, did.number, did.provider)}
                                                                                    />
                                                                                </div>
                                                                            </th>
                                                                            <td style={{ padding: '0.2rem 0.2rem' }}>{did.number} <br /><span className='font-size-11 '>(Per minute fee: ${orderDidRate.did_per_minute_fee})</span></td>
                                                                            <input type="hidden" value={did.provider} />
                                                                            <td style={{ padding: '0.2rem 0.2rem' }}>$ {orderDidRate.dids_cost}</td>
                                                                            <td style={{ padding: '0.2rem 0.2rem' }}>$ {orderDidRate.did_setup_fee}</td>
                                                                            {/* <td style={{ padding: '0.2rem 0.2rem' }}>$ {orderDidRate.did_per_minute_fee}</td> */}
                                                                            {/* <td style={{ padding: '0.2rem 0.2rem' }}>
                                                                                                <button
                                                                                                    className="btn btn-warning btn-rounded waves-effect waves-light btn-md px-5 py-1"
                                                                                                    type="button"
                                                                                                    onClick={() => handleClick(did.number, did.provider)}
                                                                                                >
                                                                                                    Order
                                                                                                </button>
                                                                                            </td> */}
                                                                        </tr>
                                                                    ))
                                                                )}

                                                            </tbody>
                                                        )}
                                                    </table>

                                                </div>

                                                <hr />
                                                <PaginationComponent {...pgntn_props} />
                                                {orderlist.length > 0 ? (
                                                    <div
                                                        className="d-grid gap-2 d-md-flex justify-content-sm-end mt-4">
                                                        {Object.keys(selectedCheckboxes)?.length > 0 &&
                                                            <button
                                                                className="btn btn-warning rounded-pill mb-3 me-1 px-5"
                                                                type="button" onClick={handleClearClick}>Cancel</button>}
                                                        <button
                                                            className="btn btn-success rounded-pill mb-3 me-1 px-5"
                                                            type="button" onClick={handleBulkOrderClick}>Order</button>
                                                    </div>
                                                ) : null}
                                            </>


                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {!showOrderDidPage && !showOrderConfirmed && (
                    //  {/* OrderConfirmation start */}
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="card">
                                <div className="card-body" >
                                    <h4 className="card-title mb-4 h4-card">Selected  {transformText(types, 'capitalize')} DIDs</h4>
                                    {/* {selectedDids.length > 0 && ( */}
                                    <div className="table-responsive" style={{ height: "500px", overflowY: "scroll" }}>
                                        <table className="table table-bordered  mb-0" >
                                            <thead >
                                                <tr>
                                                    {/* <th>S.No</th> */}
                                                    <th>Selected  {transformText(types, 'capitalize')}DIDs</th>
                                                    {/* <th>Provider</th> */}
                                                    <th>MRC</th>
                                                    <th>Set Up Fee</th>
                                                    {/* <th>Per Minute Fee</th> */}
                                                    <th>Total</th>
                                                </tr>
                                            </thead>

                                            <tbody >
                                                {Object.values(selectedCheckboxes)?.map((checkbox, index) => (
                                                    <tr key={index}>
                                                        {/* <td>{checkbox.index}</td> */}
                                                        <td>{checkbox.number} <br /><span className='font-size-11 '>(Per minute fee: ${orderDidRate.did_per_minute_fee})</span></td>
                                                        {/* <td>{checkbox.provider}</td> */}
                                                        <td>$ {orderDidRate.dids_cost}</td>
                                                        <td>$ {orderDidRate.did_setup_fee}</td>
                                                        {/* <td>$ {orderDidRate.did_per_minute_fee}</td> */}
                                                        {/* <td>$ {(parseFloat(orderDidRate.dids_cost) + parseFloat(orderDidRate.did_setup_fee) + parseFloat(orderDidRate.did_per_minute_fee)).toFixed(4)}</td> */}
                                                        <td>$ {(parseFloat(orderDidRate.dids_cost) + parseFloat(orderDidRate.did_setup_fee)).toFixed(4)}</td>
                                                    </tr>
                                                ))}

                                            </tbody>
                                            {/* )} */}
                                        </table>
                                    </div>
                                    {/* )} */}
                                    <div
                                        className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                                        <button className="btn btn-warning rounded-pill mb-3 me-1 px-5" type="button"
                                            onClick={() => {
                                                setShowOrderDidPage(!showOrderDidPage);
                                                setShowTable(true);
                                            }}
                                        >
                                            Back
                                        </button>
                                        <button className="btn btn-success rounded-pill mb-3 me-1 px-5 py-1" type="button"
                                            onClick={() => ConfirmationAlert('You want to confirm the Order!!', 'Confirm', handleOrderConfirming)}> Order</button>
                                    </div>
                                </div>
                            </div>

                            {/* loader for orderconfirming  */}
                            {isLoading && <div className='loader-overlay text-white'>
                                <Loader />
                            </div>}

                        </div>
                    </div>
                    // {/* OrderConfirmation end */}
                )}

                {showOrderConfirmed && (

                    //  {/* OrderConfirmed start */}
                    <div className="row">
                        <div className="col-lg-12">

                            <div className="card">
                                <div className="card-body">
                                    <h4 className="card-title mb-4 h4-card">Ordered {transformText(types, 'capitalize')} DIDs</h4>
                                    <div className="table-responsive">
                                        <table className="table table-bordered  mb-0" >
                                            <thead >
                                                <tr>
                                                    {/* <th>S.No</th> */}
                                                    <th>Ordered {transformText(types, 'capitalize')} DIDs</th>
                                                    {/* <th>Provider</th> */}
                                                    {/* <th>Description</th> */}
                                                    <th>Order Status</th>
                                                    {/* <th>Routing</th> */}
                                                </tr>
                                            </thead>
                                            {isLoading ? (
                                                <Loader />
                                            ) : (
                                                <tbody>
                                                    {orderedDids.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="6" className="text-center">No data available</td>
                                                        </tr>
                                                    ) : (
                                                        orderedDids?.map((orderedDid, index) => (
                                                            <tr key={index}>
                                                                <td>{orderedDid.tn}</td>
                                                                {/* <td>{orderedDid.provider}</td> */}
                                                                <td>{orderedDid.order_status}</td>
                                                                {/* <td className={orderedDid.order_status === 0 ? "text-danger" : "text-success"}>
                                                                    {orderedDid.order_status === 0 ? "Failed" : "Completed"}
                                                                </td> */}
                                                                {/* <td>
                                            <select className="form-select" name="selectRoute" {...register('selectRoute')} aria-label="Default select example">
                                                <option value=" " hidden>Select Route</option>
                                                {routes.map((route, index) => (
                                                    <option value={route.ipaddr}>{route.ipaddr}</option>
                                                ))}
                                            </select>
                                        </td> */}
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            )}
                                        </table>
                                        <div
                                            className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                                            <button className="btn btn-warning rounded-pill mb-3 me-1 px-5" type="button"
                                                onClick={handleOrderConfmBack}>Back</button>
                                        </div>
                                    </div>



                                </div>
                            </div>

                        </div>
                    </div>

                )}

            </div>
        </main >
    )
}
