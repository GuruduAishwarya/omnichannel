import React, { useEffect, useState } from 'react';
import { ConfirmationAlert, capitalizeFirst, formatDate, getToken, pageReload, simpleAlert, triggerAlert } from '../../../utils/CommonFunctions'
import * as html2pdf from 'html2pdf.js';
// import companyLogo from '../pages/Whatsapp/Payments/companyLogo.png'
import Loader from '../../../common/components/Loader';
import { GetInvoiceData, SendInvoiceData } from '../../../utils/ApiClient';

const PdfGen = ({ data, type }) => {
    // console.log('dataPdfGen', data)

    const api_url = process.env.REACT_APP_API_BASE_URL;
    const token = getToken();
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [invoiceTotalCost, setInvoiceTotalCost] = useState(0);
    const [invoiceHtml, setInvoiceHtml] = useState("");
    const [isLoading, setIsLoading] = useState(false)
    useEffect(() => {
        let debounceTimeout;

        if (data) {
            // console.log("PdfGen");
            const { data: invoiceID } = data; // Extract invoiceID from data object

            // Clear previous timeout
            clearTimeout(debounceTimeout);

            // Set new timeout
            debounceTimeout = setTimeout(async () => {
                try {
                    const response = await GetInvoiceData(data)
                    // console.log('responceInGen', response);
                    const response_data = response.data;
                    const items = response_data.results.data;
                    // console.log('items', items);
                    setSelectedInvoice(items);
                    setInvoiceHtml(items.invoice_cat);

                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            }, 500); // Adjust debounce time as needed
        }

        return () => {
            clearTimeout(debounceTimeout);
        }
    }, [data]);

    useEffect(() => {
        if (selectedInvoice) { // Check if selectedInvoice is not null

            let calculatedPlansCost = 0;
            let calculatedTotalCost = 0;

            const invoiceTaxPercentage = parseFloat(selectedInvoice.plan_tax) || 0; // Get the tax percentage

            if (selectedInvoice.invoice_cat === 'I') {
                selectedInvoice.plan_option.forEach((plan) => {
                    const planTotal = parseFloat(plan.total) || 0;
                    calculatedPlansCost += planTotal;
                });
            } else {
                calculatedPlansCost = parseFloat(selectedInvoice.invoice_amount) || 0;
            }

            // Calculate tax amount based on percentage
            const taxAmount = (calculatedPlansCost * invoiceTaxPercentage) / 100;


            // Add tax amount to the calculatedPlansCost
            calculatedTotalCost = calculatedPlansCost + taxAmount;
            // console.log('calculatedTotalCost', calculatedTotalCost)

            // Update the state with the total cost
            setInvoiceTotalCost(calculatedTotalCost);
            setTimeout(() => {
                generatePDFAndSend(selectedInvoice);
            }, 2000);


        }
    }, [selectedInvoice])
    // console.log('selectedInv', selectedInvoice)

    const generatePDFAndSend = async (apiData) => {
        const htmlContent = document.getElementById('invoice_div').innerHTML;

        const pdfOptions = {
            margin: 10,
            filename: 'invoice.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
        };

        const pdfBlob = await html2pdf().set(pdfOptions).from(htmlContent).toPdf().output('blob');
        // console.log('pdfBlob', pdfBlob);

        const reader = new FileReader();
        reader.readAsDataURL(pdfBlob);  // Read the PDF Blob
        reader.onloadend = () => {
            // console.log('result', reader.result);
            const base64Data = reader.result.split(',')[1];
            // console.log('Base64 PDF:', base64Data);
            sendInvoice(base64Data)


        };
    };

    const sendInvoice = async (base64Data) => {
        if (data && type === 'send_invoice') {
            setIsLoading(true);
        }
        const api_input = {

            invoice_id: data, // Use data.data as invoiceID
            type: type,
            pdf_base_64: base64Data
        }
        try {
            const response = await SendInvoiceData(api_input)
            const response_data = response.data;
            // console.log('sendInvoice', response);
            if (data && type === 'recharge') {
                pageReload();
            }
            if (data && type === 'send_invoice' && response_data.error_code === 200) {

                triggerAlert('success', 'Success', response_data.results);
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            if (data && type === 'send_invoice') {
                setIsLoading(false);
                triggerAlert('error', '', 'Something went wrong! Please Try Again');
            }
        }
    };



    return (
        <>
            {isLoading ? (
                <div className='loader-overlay text-white'>
                    <Loader />
                </div>
            ) : null
            }
            <div style={{ display: "none" }}>
                {invoiceHtml === 'I' &&
                    <div id='invoice_div' >
                        <div >
                            <div className="card invoice-preview-card px-5 py-2" style={{ border: "3px solid #ee6724" }} >
                                <div className='whole_body' >
                                    <div className="card-body px-0 py-0">
                                        <div className="row d-flex justify-content-between flex-wrap mb-2">
                                            <div className="col-4 mb-xl-0 mb-4 d-flex flex-column">

                                                <span className="mb-0 fw-semibold">Vitel Global Communications LLC., </span>
                                                <span className="mb-0">295 Durham Avenue, Suite D,</span>
                                                <span className="mb-0">South Plainfiled, New Jersey, USA.</span>
                                                <span className="mb-0">Tel:732-444-3132, Fax:732-444-3436</span>
                                                <span className="mb-0">info@vitelglobal.com</span>
                                            </div>
                                            <div className="col-4 d-flex svg-illustration justify-content-center flex-column align-items-center">
                                                <img src="/assets/images/companyLogo.png" width="250" alt='Vitelglobal' />
                                                <div className='mt-5 fw-semibold'>INVOICE</div>
                                            </div>

                                            <div className='col-4 d-flex flex-column justify-content-center align-items-end'>

                                                <div className="mb-0 pt-1">
                                                    <span>Invoice:</span>
                                                    <span className="fw-semibold">    #{selectedInvoice?.invoice_number ? selectedInvoice.invoice_number : '-'}</span>
                                                </div>
                                                <div className="mb-0 pt-1">
                                                    <span>Date:</span>

                                                    <span className="fw-semibold">    {selectedInvoice?.invoice_date ? selectedInvoice?.invoice_date : '-'}</span>
                                                </div>

                                            </div>
                                        </div>

                                    </div>
                                    <hr className="my-0 mb-3" />
                                    <div className="card-body" style={{ border: "1px solid #ee6724" }}>
                                        <div className="row" >
                                            <div className="col-md-12">
                                                <h5 className="mb-4 h5-card text-center">Customer Information</h5>
                                                <table className='col-md-10'>
                                                    <tbody class="row">
                                                        <tr class="d-flex justify-content-around">
                                                            <td className="col-3">Company Name :</td>
                                                            <td className='col-7'>{selectedInvoice?.company_name}</td>
                                                        </tr>
                                                        <tr class="d-flex justify-content-around">
                                                            <td className="col-3">Contact Name :</td>
                                                            <td className="col-7" >{selectedInvoice?.user_name}</td>
                                                        </tr>
                                                        <tr class="d-flex justify-content-around">
                                                            <td className="col-3">Email Id :</td>
                                                            <td className="col-7" >{selectedInvoice?.email}</td>
                                                        </tr>
                                                        <tr class="d-flex justify-content-around">
                                                            <td className="col-3">Address :</td>
                                                            <td className="col-7" >{selectedInvoice?.address + ', ' + selectedInvoice?.zipcode + ', ' + selectedInvoice?.city + ', ' + selectedInvoice?.state + ', ' + selectedInvoice?.country + '.'} </td>
                                                        </tr>
                                                        <tr class="d-flex justify-content-around">
                                                            <td className="col-3">Phone :</td>
                                                            <td className="col-7" >{selectedInvoice?.phone}</td>
                                                        </tr>
                                                        <tr class="d-flex justify-content-around">
                                                            <td className="col-3">Plan Type :</td>
                                                            <td className="col-7" >Pay As You Go</td>
                                                        </tr>

                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                    <h5 className="mb-4 mt-3  h5-card text-center">Billing Information</h5>
                                    <div className="table-responsive border-top">
                                        <table className="table m-0 px-4">
                                            <thead style={{ backgroundColor: "#ee6724", color: "#fff" }}>
                                                <tr>
                                                    <th class="text-white p-0">DESCRIPTION</th>
                                                    <th class="text-white p-0">QUANTITY</th>
                                                    <th class="text-white p-0">UNIT PRICE</th>
                                                    <th class="text-white p-0">BILL MONTHS</th>
                                                    <th class="text-white p-0">TOTAL</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedInvoice?.plan_option.map((plan) => (
                                                    <tr style={{ backgroundColor: plan.description === 'Number of Paid DIDs' ? 'white' : '#efefef' }}>
                                                        <td className="text-nowrap p-0">{plan?.description}</td>
                                                        <td className="text-nowrap p-0">{plan?.quantity}</td>
                                                        <td className='p-0'>$ {plan?.unit_price}</td>
                                                        <td className='p-0'>{plan?.billing_months}</td>
                                                        <td className='p-0'>$ {plan?.total}</td>
                                                    </tr>
                                                ))}

                                                <tr>
                                                    <td className="text-nowrap p-0">Tax</td>
                                                    <td className="text-nowrap p-0"></td>
                                                    <td className='p-0'></td>
                                                    <td className='p-0'>{selectedInvoice?.plan_tax}%</td>
                                                    <td className='p-0'>${(selectedInvoice?.invoice_amount * selectedInvoice?.plan_tax) / 100}</td>
                                                </tr>
                                                {selectedInvoice?.card_type !== "AmExCard" ? (
                                                    <>
                                                        {selectedInvoice?.discount_status === 'Y' ? (
                                                            <>
                                                                <tr>
                                                                    <td className="text-nowrap p-0">Discount</td>
                                                                    <td className="text-nowrap p-0"></td>
                                                                    <td className='p-0'></td>
                                                                    <td className='p-0'></td>
                                                                    <td className='p-0'>${selectedInvoice?.discount_amt}</td>
                                                                </tr>
                                                                <tr style={{ backgroundColor: '#ee6724', color: '#fff' }}>
                                                                    <td className="text-white text-nowrap p-0">Grand Total</td>
                                                                    <td className="text-nowrap p-0"></td>
                                                                    <td className='p-0'></td>
                                                                    <td className='p-0'></td>
                                                                    <td className='text-white p-0'>${invoiceTotalCost - selectedInvoice?.discount_amt}</td>
                                                                </tr>
                                                            </>
                                                        ) :
                                                            <tr style={{ backgroundColor: '#ee6724', color: '#fff' }}>
                                                                <td className="text-white text-nowrap p-0">Grand Total</td>
                                                                <td className="text-nowrap p-0"></td>
                                                                <td className='p-0'></td>
                                                                <td className='p-0'></td>
                                                                <td className='text-white p-0'>${invoiceTotalCost}</td>
                                                            </tr>

                                                        }
                                                    </>
                                                ) : (
                                                    <>
                                                        {selectedInvoice.discount_status === 'Y' ? (
                                                            <>
                                                                <tr>
                                                                    <td className="text-nowrap p-0">Discount</td>
                                                                    <td className="text-nowrap p-0"></td>
                                                                    <td className='p-0'></td>
                                                                    <td className='p-0'></td>
                                                                    <td className='p-0'>${selectedInvoice?.discount_amt}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="text-nowrap p-0">AmExCard Processing Fee - 4%</td>
                                                                    <td className="text-nowrap p-0"></td>
                                                                    <td className='p-0'></td>
                                                                    <td className='p-0'></td>
                                                                    <td className='p-0'>${(((invoiceTotalCost - selectedInvoice?.discount_amt) * 0.04)).toFixed(3)}</td>
                                                                </tr>
                                                                <tr style={{ backgroundColor: '#ee6724', color: '#fff' }}>
                                                                    <td className="text-white text-nowrap p-0">Grand Total</td>
                                                                    <td className="text-nowrap p-0"></td>
                                                                    <td className='p-0'></td>
                                                                    <td className='p-0'></td>
                                                                    <td className='text-white p-0'>${(invoiceTotalCost - selectedInvoice?.discount_amt) * 0.04 + (invoiceTotalCost - selectedInvoice?.discount_amt)}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td className='p-0 mt-3' align="left" height="15" colspan="5">Note : From January 1st, 2016, payments through Amex credit cards would attract 4% processing fee and you will be charged accordingly. If you would like to avoid the charges, we request you to move to other Debit/Credit cards or e-check payments.</td>
                                                                </tr>

                                                            </>
                                                        ) : (
                                                            <>
                                                                <tr>
                                                                    <td className="text-nowrap p-0">AmExCard Processing Fee - 4%</td>
                                                                    <td className="text-nowrap p-0"></td>
                                                                    <td className='p-0'></td>
                                                                    <td className='p-0'></td>
                                                                    <td className='p-0'>${(invoiceTotalCost * 0.04).toFixed(3)}</td>
                                                                </tr>
                                                                <tr style={{ backgroundColor: '#ee6724', color: '#fff' }}>
                                                                    <td className="text-white text-nowrap p-0">Grand Total</td>
                                                                    <td className="text-nowrap p-0"></td>
                                                                    <td className='p-0'></td>
                                                                    <td className='p-0'></td>
                                                                    <td className='text-white p-0'>${(invoiceTotalCost * 0.04) + invoiceTotalCost}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td className='p-0 mt-3' align="left" height="15" colspan="5">Note : From January 1st, 2016, payments through Amex credit cards would attract 4% processing fee and you will be charged accordingly. If you would like to avoid the charges, we request you to move to other Debit/Credit cards or e-check payments.</td>
                                                                </tr>

                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="card-body mx-3">
                                        <div className="row">
                                            <div className="col-12 d-flex flex-column justify-content-center align-items-center">
                                                <span className="fw-semibold">Thanks for your business</span>
                                                {(selectedInvoice?.did_list_free_list.length > 0 || selectedInvoice?.did_list_paid_list.length > 0) &&
                                                    <span>Scroll down for detailed invoice.</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {(selectedInvoice?.did_list_free_list.length > 0 || selectedInvoice?.did_list_paid_list.length > 0) &&
                            <>
                                <div className='html2pdf__page-break'>
                                    {/* for page break */}
                                </div>

                                <div >
                                    <div className="card invoice-preview-card px-5 py-2" style={{ border: "3px solid #ee6724" }}>
                                        <div className='whole_body'>
                                            <div className="card-body px-0 py-0">
                                                <div className="row d-flex justify-content-between flex-wrap mb-2">
                                                    <div className="col-4 mb-xl-0 mb-4 d-flex flex-column">

                                                        <span className="mb-0 fw-semibold">Vitel Global Communications LLC., </span>
                                                        <span className="mb-0">295 Durham Avenue, Suite D,</span>
                                                        <span className="mb-0">South Plainfiled, New Jersey, USA.</span>
                                                        <span className="mb-0">Tel:732-444-3132, Fax:732-444-3436</span>
                                                        <span className="mb-0">info@vitelglobal.com</span>
                                                    </div>
                                                    <div className="col-4 d-flex svg-illustration justify-content-center flex-column align-items-center">
                                                        <img src="/assets/images/companyLogo.png" width="250" alt='Vitelglobal' />
                                                        <div className='mt-5 fw-semibold'>INVOICE</div>
                                                    </div>

                                                    <div className='col-4 d-flex flex-column justify-content-center align-items-end'>

                                                        <div className="mb-0 pt-1">
                                                            <span>Invoice</span>
                                                            <span className="fw-semibold">    #{selectedInvoice?.invoice_number ? selectedInvoice.invoice_number : '-'}</span>
                                                        </div>
                                                        <div className="mb-0 pt-1">
                                                            <span>Date Issued</span>
                                                            <span className="fw-semibold">    {selectedInvoice?.invoice_date ? selectedInvoice?.invoice_date : '-'}</span>
                                                        </div>

                                                    </div>
                                                </div>

                                            </div>
                                            <hr className="my-0 mb-3" />

                                            <div class="card-body p-0">
                                                <div class="row p-0 text-center" >
                                                    <h5 class=" h4-card">DID List</h5>
                                                </div>

                                            </div>
                                            <div class="table-responsive  ">
                                                <table class="table m-0">
                                                    <thead>
                                                        <tr>
                                                            <th colspan="6" className='px-3'>DID</th>
                                                            <th colspan="6" className='text-end px-3'>Price</th>

                                                        </tr>

                                                    </thead>
                                                    <tbody>
                                                        {selectedInvoice?.did_list_free_list.map((freeDid) => (
                                                            <tr>
                                                                <td colspan="6" className='px-3'>{freeDid}</td>
                                                                <td colspan="6" className='text-end px-3'>$ 0.00</td>
                                                            </tr>
                                                        ))}
                                                        {selectedInvoice?.did_list_paid_list.map((paidDid) => (
                                                            <tr>
                                                                <td colspan="6" className='px-3'>{paidDid}</td>
                                                                <td colspan="6" className='text-end px-3'>$ {selectedInvoice?.dids_cost}</td>
                                                            </tr>
                                                        ))}
                                                        <tr>
                                                            <td colspan="6" className='fw-semibold px-3'>Total Amount</td>
                                                            <td colspan="6" className='text-end'>  <p className="fw-semibold mb-2 px-3">$ {selectedInvoice?.paid_dids * selectedInvoice?.dids_cost}</p></td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="card-body mx-3">
                                                <div className="row">
                                                    <div className="col-12 d-flex flex-column justify-content-center align-items-center">
                                                        <span className="fw-semibold">Thanks for your business</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        }
                    </div>
                }
                {/* Download JSX - Refill bill*/}
                {invoiceHtml === 'R' &&
                    <div id='invoice_div'  >
                        <div >
                            <div className="card invoice-preview-card px-5 py-2" style={{ border: "3px solid #ee6724" }}>
                                <div className='whole_body'>
                                    <div className="card-body px-0 py-0">
                                        <div className="row d-flex justify-content-between flex-wrap mb-2">
                                            <div className="col-4 mb-xl-0 mb-4 d-flex flex-column">

                                                <span className="mb-0 fw-semibold">Vitel Global Communications LLC., </span>
                                                <span className="mb-0">295 Durham Avenue, Suite D,</span>
                                                <span className="mb-0">South Plainfiled, New Jersey, USA.</span>
                                                <span className="mb-0">Tel:732-444-3132, Fax:732-444-3436</span>
                                                <span className="mb-0">info@vitelglobal.com</span>
                                            </div>
                                            <div className="col-4 d-flex svg-illustration justify-content-center flex-column align-items-center">
                                                <img src="/assets/images/companyLogo.png" width="250" alt='Vitelglobal' />
                                                <div className='mt-5 fw-semibold'>INVOICE</div>
                                            </div>

                                            <div className='col-4 d-flex flex-column justify-content-center align-items-end'>
                                                <div className="mb-0 pt-1">
                                                    <span>Invoice:</span>
                                                    <span className="fw-semibold">    #{selectedInvoice?.invoice_number ? selectedInvoice.invoice_number : '-'}</span>
                                                </div>
                                                <div className="mb-0 pt-1">
                                                    <span>Date:</span>
                                                    <span className="fw-semibold">    {selectedInvoice?.invoice_date ? selectedInvoice?.invoice_date : '-'}</span>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                    <hr className="my-0 mb-3" />
                                    <div className="card-body" style={{ border: "1px solid #ee6724" }}>
                                        <div className="row" >
                                            <div className="col-md-12">
                                                <h5 className="mb-4 h5-card text-center">Customer Information</h5>
                                                <table className='col-md-10'>
                                                    <tbody class="row">
                                                        <tr class="d-flex justify-content-around">
                                                            <td className="col-3">Company Name :</td>
                                                            <td className='col-7'>{selectedInvoice?.company_name}</td>
                                                        </tr>
                                                        <tr class="d-flex justify-content-around">
                                                            <td className="col-3">Contact Name :</td>
                                                            <td className="col-7" >{selectedInvoice?.user_name}</td>
                                                        </tr>
                                                        <tr class="d-flex justify-content-around">
                                                            <td className="col-3">Email Id :</td>
                                                            <td className="col-7" >{selectedInvoice?.email}</td>
                                                        </tr>
                                                        <tr class="d-flex justify-content-around">
                                                            <td className="col-3">Address :</td>
                                                            <td className="col-7" >{selectedInvoice?.address + ', ' + selectedInvoice?.zipcode + ', ' + selectedInvoice?.city + ', ' + selectedInvoice?.state + ', ' + selectedInvoice?.country + '.'} </td>
                                                        </tr>
                                                        <tr class="d-flex justify-content-around">
                                                            <td className="col-3">Phone :</td>
                                                            <td className="col-7" >{selectedInvoice?.phone}</td>
                                                        </tr>
                                                        <tr class="d-flex justify-content-around">
                                                            <td className="col-3">Plan Type :</td>
                                                            <td className="col-7" >Pay As You Go</td>
                                                        </tr>

                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                    <h5 className="mb-4 mt-3  h5-card text-center">Billing Information</h5>
                                    <div className="table-responsive border-top">
                                        <table className="table m-0 px-4">
                                            <thead style={{ backgroundColor: "#ee6724", color: "#fff" }}>
                                                <tr>
                                                    <th class="text-white p-0">DESCRIPTION</th>
                                                    {/* <th class=" p-0">QUANTITY</th> */}
                                                    <th class="text-white p-0">UNIT PRICE</th>
                                                    {/* <th class=" p-0">BILL MONTHS</th> */}
                                                    <th class="text-white p-0">TOTAL</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="text-nowrap p-0">{selectedInvoice?.comments}</td>

                                                    <td className='p-0'>${selectedInvoice?.invoice_amount}</td>

                                                    <td className='p-0'>${selectedInvoice?.invoice_amount}</td>
                                                </tr>

                                                <tr>
                                                    <td className="text-nowrap p-0">Tax</td>
                                                    <td className="text-nowrap p-0">{selectedInvoice?.plan_tax}%</td>
                                                    <td className='p-0'>${(selectedInvoice?.invoice_amount * selectedInvoice?.plan_tax) / 100}</td>
                                                </tr>
                                                {selectedInvoice?.card_type !== "AmExCard" ? (
                                                    <>
                                                        {selectedInvoice?.discount_status === 'Y' ? (
                                                            <>
                                                                <tr>
                                                                    <td className="text-nowrap p-0">Discount</td>
                                                                    <td className="text-nowrap p-0"></td>

                                                                    <td className='p-0'>${selectedInvoice?.discount_amt}</td>
                                                                </tr>
                                                                <tr style={{ backgroundColor: '#ee6724', color: '#fff' }}>
                                                                    <td className="text-white text-nowrap p-0">Grand Total</td>
                                                                    <td className="text-white text-nowrap p-0"></td>

                                                                    <td className='text-white p-0'>${invoiceTotalCost - selectedInvoice?.discount_amt}</td>
                                                                </tr>
                                                            </>
                                                        ) :
                                                            <tr style={{ backgroundColor: '#ee6724', color: '#fff' }}>
                                                                <td className="text-white text-nowrap p-0">Grand Total</td>
                                                                <td className="text-white text-nowrap p-0"></td>

                                                                <td className='text-white p-0'>${invoiceTotalCost}</td>
                                                            </tr>

                                                        }
                                                    </>
                                                ) : (
                                                    <>
                                                        {selectedInvoice.discount_status === 'Y' ? (
                                                            <>
                                                                <tr>
                                                                    <td className="text-nowrap p-0">Discount</td>
                                                                    <td className="text-nowrap p-0"></td>

                                                                    <td className='p-0'>${selectedInvoice?.discount_amt}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="text-nowrap p-0">AmExCard Processing Fee - 4%</td>
                                                                    <td className="text-nowrap p-0"></td>

                                                                    <td className='p-0'>${(((invoiceTotalCost - selectedInvoice?.discount_amt) * 0.04)).toFixed(3)}</td>
                                                                </tr>
                                                                <tr style={{ backgroundColor: '#ee6724', color: '#fff' }}>
                                                                    <td className="text-white text-nowrap p-0">Grand Total</td>
                                                                    <td className="text-white text-nowrap p-0"></td>

                                                                    <td className='text-white p-0'>${((invoiceTotalCost - selectedInvoice?.discount_amt) * 0.04) + (invoiceTotalCost - selectedInvoice?.discount_amt)}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td className='p-0 mt-3' align="left" height="15" colspan="5">Note : From January 1st, 2016, payments through Amex credit cards would attract 4% processing fee and you will be charged accordingly. If you would like to avoid the charges, we request you to move to other Debit/Credit cards or e-check payments.</td>
                                                                </tr>

                                                            </>
                                                        ) : (
                                                            <>
                                                                <tr>
                                                                    <td className="text-nowrap p-0">AmExCard Processing Fee - 4%</td>
                                                                    <td className="text-nowrap p-0"></td>

                                                                    <td className='p-0'>${(invoiceTotalCost * 0.04).toFixed(3)}</td>
                                                                </tr>
                                                                <tr style={{ backgroundColor: '#ee6724', color: '#fff' }}>
                                                                    <td className="text-white text-nowrap p-0">Grand Total</td>
                                                                    <td className="text-white text-nowrap p-0"></td>

                                                                    <td className='text-white p-0'>${(invoiceTotalCost * 0.04) + invoiceTotalCost}</td>
                                                                </tr>
                                                                <tr className='mt-4'>
                                                                    <td className='p-0 mt-3' align="left" height="15" colspan="5">Note : From January 1st, 2016, payments through Amex credit cards would attract 4% processing fee and you will be charged accordingly. If you would like to avoid the charges, we request you to move to other Debit/Credit cards or e-check payments.</td>
                                                                </tr>

                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="card-body mx-3">
                                        <div className="row">
                                            <div className="col-12 d-flex flex-column justify-content-center align-items-center">
                                                <span className="fw-semibold">Thanks for your business</span>
                                                {(selectedInvoice?.did_list_free_list.length > 0 || selectedInvoice?.did_list_paid_list.length > 0) &&
                                                    <span>Scroll down for detailed invoice.</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div><br />
                    </div>
                }
            </div>
        </>
    );
};

export default PdfGen;