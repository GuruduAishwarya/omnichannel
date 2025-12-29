import React, { useEffect, useRef, useState } from "react";
import PageTitle from "../../../common/PageTitle";
import { sendInvoiceBilling } from "../../../utils/ApiClient";
import {
  getCustomerId,
  triggerAlert,
  formatDateTime,
  getCookie,
} from "../../../utils/CommonFunctions";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { useForm, Controller } from "react-hook-form";
import * as html2pdf from "html2pdf.js";
import Loader from "../../../common/components/Loader";
import {
  GetInVoiceList,
  sendEmailbase64,
  fetchWorkspace,
  billingMonthlyInvoice,
} from "../../../utils/ApiClient";
import jsPDF from "jspdf";
import ReactToPrint, {
  useReactToPrint as useReactToPrintHook,
} from "react-to-print";
import axios from "axios";

const useReactToPrint =
  typeof useReactToPrintHook === "function"
    ? useReactToPrintHook
    : () => () => window.print();

const selectStyles = {
  backgroundColor: "#ffffff",
  color: "#333333",
  border: "1px solid #ced4da",
  borderRadius: "0.25rem",
  padding: "0.375rem 0.75rem",
  fontSize: "1rem",
  lineHeight: "1.5",
  fontWeight: "400",
};

const invoiceStyles = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
    pageBreakInside: "auto",
    border: "1px solid #FF9800",
  },
  th: {
    background: "#ed7d31",
    color: "#fff",
    padding: "6px 11px",
    whiteSpace: "normal",
    textAlign: "center",
  },
  tr: {
    pageBreakInside: "avoid",
    pageBreakAfter: "auto",
    background: "#fbe4d5",
  },
  td: {
    padding: "6px 11px",
    whiteSpace: "normal",
    overflow: "hidden",
    textOverflow: "ellipse",
    wordBreak: "break-word",
  },
  altRow: {
    background: "#fbe4d5",
  },
  textCell: {
    whiteSpace: "normal",
    wordBreak: "break-word",
    paddingLeft: "6px",
  },
  noWrap: {
    whiteSpace: "nowrap",
  },
  wrap: {
    whiteSpace: "normal",
    wordBreak: "break-word",
  },
};

export default function InvoiceHistory() {
  const currentDate = new Date();
  const customer_id = getCustomerId();
  const workspace_id_from_cookie = getCookie("selected_workspace_id");
  const [workspaceId, setWorkspaceId] = useState(
    workspace_id_from_cookie || ""
  );
  const [workspaces, setWorkspaces] = useState([]);
  const [invoiceData, setInvoiceData] = useState(null);
  const recharge_invoices = invoiceData?.recharge_invoices || [];
  const defaultFormValues = {
    period_start: currentDate,
    period_end: currentDate,
    selected_month: "",
    selected_year: "",
  };

  const {
    register,
    formState: { errors },
    control,
    watch,
    setError,
    clearErrors,
    getValues,
    setValue,
    reset,
  } = useForm({
    defaultValues: defaultFormValues,
  });

  const [period_start, setPeriodStart] = useState(currentDate);
  const [period_end, setPeriodEnd] = useState(currentDate);
  const [minEndDate, setMinEndDate] = useState(currentDate);
  const [activeInvoiceTab, setActiveInvoiceTab] = useState("month_wise");
  const [showInvoiceButtons, setShowInvoiceButtons] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [printInvoice, setPrintInvoice] = useState(false);
  const [isSendingInvoice, setIsSendingInvoice] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [totalPlansCost, setTotalPlansCost] = useState(0);
  const [invoiceTotalCost, setInvoiceTotalCost] = useState(0);
  const [hasDataLoaded, setHasDataLoaded] = useState({
    month_wise: false,
    date_wise: false,
    current_month: false,
    last_3_month: false,
    last_6_month: false,
  });

  const selectedMonth = Number(watch("selected_month"));
  const selectedYear = watch("selected_year");
  const invoiceToPrintRef = useRef();
  const datepickerfromRef = useRef(null);
  const datepickerToRef = useRef(null);

  // Helper function to format date as YYYY-MM-DD
  const formatDateYYYYMMDD = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleTabChange = (tab) => {
    setActiveInvoiceTab(tab);
    setShowInvoiceButtons(false);
    setSelectedInvoice(null);
    setInvoices([]);
    setInvoiceData(null);
    clearErrors(["selected_month", "selected_year", "period_start", "period_end"]);
    if (tab === "month_wise") {
      setValue("selected_month", "");
      setValue("selected_year", "");
      setValue("period_start", defaultFormValues.period_start);
      setValue("period_end", defaultFormValues.period_start);
      setMinEndDate(defaultFormValues.period_start);
    } else {
      setValue("selected_month", "");
      setValue("selected_year", "");
    }
    if (
      hasDataLoaded[tab] &&
      (tab === "current_month" ||
        tab === "last_3_month" ||
        tab === "last_6_month")
    ) {
      setShowInvoiceButtons(true);
    } else if (
      tab === "current_month" ||
      tab === "last_3_month" ||
      tab === "last_6_month"
    ) {
      fetchInvoiceData(tab);
    } else {
      setShowInvoiceButtons(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!workspaceId) {
      triggerAlert("warning", "", "Please select a workspace");
      return;
    }
    setInvoices([]);
    setSelectedInvoice(null);
    const selectedMonth = watch("selected_month");
    const selectedYear = watch("selected_year");
    const { period_start, period_end } = getValues();
    clearErrors(["selected_month", "selected_year", "period_start", "period_end"]);
    if (activeInvoiceTab === "month_wise") {
      if (!selectedMonth || selectedMonth.trim() === "") {
        setError("selected_month", {
          type: "manual",
          message: "Month is required",
        });
        setShowInvoiceButtons(false);
      }
      if (!selectedYear || selectedYear.trim() === "") {
        setError("selected_year", {
          type: "manual",
          message: "Year is required",
        });
        setShowInvoiceButtons(false);
      }
      if (!selectedMonth || !selectedYear) {
        return;
      }
    }
    let hasError = false;
    if (!period_start) {
      setError("period_start", {
        type: "manual",
        message: "From Date is required",
      });
      hasError = true;
    }
    if (!period_end) {
      setError("period_end", {
        type: "manual",
        message: "To Date is required",
      });
      hasError = true;
    }
    if (hasError) {
      return;
    }
    const startDate = new Date(period_start);
    const endDate = new Date(period_end);
    if (startDate > endDate) {
      setError("period_start", {
        type: "manual",
        message: "From date cannot be later than to date",
      });
      return;
    }
    setShowInvoiceButtons(true);
    fetchInvoiceData(activeInvoiceTab);
  };

  const fetchInvoiceData = async (tab) => {
    setIsLoading(true);
    setShowInvoiceButtons(false);
    setHasDataLoaded((prev) => ({ ...prev, [tab]: false }));
    const formValues = getValues();
    let api_input = {
      customer_id: customer_id,
      workspace_id: workspaceId,
      type: tab,
      from_date: "",
      to_date: "",
    };
    try {
      switch (tab) {
        case "month_wise": {
          const currentYear = formValues.selected_year
            ? parseInt(formValues.selected_year, 10)
            : new Date().getFullYear();
          const monthForAPI = formValues.selected_month
            ? parseInt(formValues.selected_month, 10)
            : new Date().getMonth() + 1;
          const payload = {
            workspace_id: workspaceId,
            year: currentYear,
            month: monthForAPI,
          };
          const response = await billingMonthlyInvoice(payload);
          if (
            response.status === 204 ||
            (response.data && !response.data.results)
          ) {
            triggerAlert(
              "info",
              "",
              "No data available for the selected month."
            );
            setInvoiceData(null);
            setShowInvoiceButtons(false);
            setHasDataLoaded((prev) => ({ ...prev, [tab]: false }));
          } else {
            const response_data = response.data;
            if (response_data.error_code === 200) {
              const results = response_data.results;

              // Filter function to check if invoice date matches selected month and year
              const filterByMonthYear = (item) => {
                if (!item.invoice_date) return false;
                const invoiceDate = new Date(item.invoice_date);
                const invoiceMonth = invoiceDate.getMonth() + 1; // JS months are 0-indexed
                const invoiceYear = invoiceDate.getFullYear();
                return invoiceMonth === monthForAPI && invoiceYear === currentYear;
              };

              // Filter MRC data
              const filteredMrcData = results.mrc_data
                ? results.mrc_data.filter(filterByMonthYear)
                : [];

              // Filter NRC data
              const filteredNrcData = results.nrc_data
                ? results.nrc_data.filter(filterByMonthYear)
                : [];

              // Filter recharge invoices
              const filteredRechargeInvoices = results.recharge_invoices
                ? results.recharge_invoices.filter(filterByMonthYear)
                : [];

              // Calculate totals for filtered data
              const filteredTotalMrc = filteredMrcData.reduce((sum, item) => sum + (item.total_amount || 0), 0);
              const filteredTotalNrc = filteredNrcData.reduce((sum, item) => sum + (item.total_amount || 0), 0);
              const filteredFundesAdded = filteredRechargeInvoices.reduce((sum, item) => sum + (parseFloat(item.invoice_amount) || 0), 0);
              const filteredTotalAmount = filteredTotalMrc + filteredTotalNrc + filteredFundesAdded;

              // Create filtered results object
              const filteredResults = {
                ...results,
                mrc_data: filteredMrcData,
                nrc_data: filteredNrcData,
                recharge_invoices: filteredRechargeInvoices,
                total_mrc: filteredTotalMrc,
                total_nrc: filteredTotalNrc,
                fundes_added: filteredFundesAdded,
                total_amount: filteredTotalAmount,
              };

              // Check if there's any data after filtering
              if (filteredMrcData.length === 0 && filteredNrcData.length === 0 && filteredRechargeInvoices.length === 0) {
                triggerAlert(
                  "info",
                  "",
                  `No invoices found for ${monthForAPI}/${currentYear}.`
                );
                setInvoiceData(null);
                setShowInvoiceButtons(false);
                setHasDataLoaded((prev) => ({ ...prev, [tab]: false }));
              } else {
                setInvoiceData(filteredResults);
                setHasDataLoaded((prev) => ({ ...prev, [tab]: true }));
                setShowInvoiceButtons(true);
              }
            } else {
              triggerAlert(
                "error",
                "",
                response_data.message || "Something went wrong."
              );
              setInvoiceData(null);
              setShowInvoiceButtons(false);
            }
          }
          break;
        }
        // case "date_wise": {
        //   const formattedFromDate = formValues.period_start
        //     ? formatDateTime(formValues.period_start, "dd-mm-yyyy")
        //     : "";
        //   const formattedToDate = formValues.period_end
        //     ? formatDateTime(formValues.period_end, "dd-mm-yyyy")
        //     : "";
        //   api_input.from_date = formattedFromDate;
        //   api_input.to_date = formattedToDate;
        //   const response = await GetInVoiceList(api_input);
        //   const response_data = response.data;
        //   if (response_data.error_code === 200) {
        //     const fetchedInvoicesList = response_data.results?.data || [];
        //     const updatedInvoiceData = fetchedInvoicesList.map((invoice) => {
        //       const planOption = invoice.plan_option?.[0] || {};
        //       return {
        //         ...invoice,
        //         Card_number: planOption.Card_number || "N/A",
        //         Due_Date: planOption.Due_Date || "N/A",
        //         tax_amount: planOption.tax_amount || 0,
        //         unit_price: planOption.unit_price || 0,
        //       };
        //     });
        //     setInvoices(updatedInvoiceData);
        //     setHasDataLoaded((prev) => ({ ...prev, [tab]: true }));
        //     setShowInvoiceButtons(true);
        //   } else {
        //     triggerAlert(
        //       "error",
        //       "",
        //       response_data.message || "Something went wrong."
        //     );
        //     setInvoices([]);
        //     setShowInvoiceButtons(false);
        //   }
        //   break;
        // }
        case "current_month":
        case "last_3_month":
        case "last_6_month": {
          const response = await GetInVoiceList(api_input);
          const response_data = response.data;
          if (response_data.error_code === 200) {
            const fetchedInvoicesList = response_data.results?.data || [];
            const updatedInvoiceData = fetchedInvoicesList.map((invoice) => {
              const planOption = invoice.plan_option?.[0] || {};
              return {
                ...invoice,
                Card_number: planOption.Card_number || "N/A",
                Due_Date: planOption.Due_Date || "N/A",
                tax_amount: planOption.tax_amount || 0,
                unit_price: planOption.unit_price || 0,
              };
            });
            setInvoices(updatedInvoiceData);
            setHasDataLoaded((prev) => ({ ...prev, [tab]: true }));
            setShowInvoiceButtons(true);
          } else {
            triggerAlert(
              "error",
              "",
              response_data.message || "Something went wrong."
            );
            setInvoices([]);
            setShowInvoiceButtons(false);
          }
          break;
        }
        default:
          setIsLoading(false);
          return;
      }
    } catch (error) {
      console.error("Error in fetching invoice data:", error);
      triggerAlert("info", "", "No data available.");
      setInvoices([]);
      setInvoiceData(null);
      setShowInvoiceButtons(false);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadInvoiceAsPDF = (htmlElement) => {
    if (!htmlElement) {
      console.error("HTML element for PDF generation not found!");
      triggerAlert("error", "", "Could not find invoice content to download.");
      return;
    }
    const fixedWidthInPoints = 595;
    const pdfOptions = {
      margin: 10,
      filename: `invoice_${selectedInvoice?.invoice_number || "details"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
      },
      jsPDF: {
        unit: "pt",
        format: [fixedWidthInPoints, htmlElement.scrollHeight],
        orientation: "portrait",
      },
    };
    html2pdf().set(pdfOptions).from(htmlElement).save();
  };

  const handleClickDatepickerFromIcon = () => {
    if (datepickerfromRef.current && datepickerfromRef.current.setOpen) {
      datepickerfromRef.current.setOpen(true);
    }
  };

  const handleClickDatepickerToIcon = () => {
    if (datepickerToRef.current && datepickerToRef.current.setOpen) {
      datepickerToRef.current.setOpen(true);
    }
  };

  const containsHTML = (str) => {
    if (typeof str !== "string") return false;
    return /<[a-z][\s\S]*>/i.test(str);
  };

  const capitalizeWords = (text) => {
    if (!text) return "";
    return text
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };


  const renderDescription = (description) => {
    if (!description) return null;

    // Normalize to array for consistent handling
    const descriptions = Array.isArray(description) ? description : [description];

    return descriptions
      .filter((item) => {
        if (typeof item !== "string") return true; // keep non-string values
        return item.toLowerCase() !== "recharge"; // skip "Recharge"
      })
      .map((item, idx) => {
        let textContent = typeof item === "string" ? item : String(item);

        // If string contains HTML, strip it
        if (typeof textContent === "string" && /<\/?[a-z][\s\S]*>/i.test(textContent)) {
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = textContent;
          textContent = tempDiv.textContent || tempDiv.innerText || "";
        }

        return (
          <p key={idx} className="mb-0" style={invoiceStyles.textCell}>
            {textContent}
          </p>
        );
      });
  };


  const handleWorkspaceChange = (e) => {
    const selectedId = e.target.value;
    setWorkspaceId(selectedId);
    setHasDataLoaded({
      month_wise: false,
      date_wise: false,
      current_month: false,
      last_3_month: false,
      last_6_month: false,
    });
    setShowInvoiceButtons(false);
    setSelectedInvoice(null);
    setInvoices([]);
    setInvoiceData(null);
  };

  const getSelectedWorkspaceFromCookies = () => {
    const id = getCookie("selected_workspace_id");
    const name = getCookie("selected_workspace_name");
    return {
      id: id || null,
      name: name || "Default Workspace",
    };
  };

  const fetchWorkspaceData = async () => {
    setIsLoading(true);
    try {
      const response = await fetchWorkspace();
      if (response?.data?.error_code === 200) {
        const workspaceData = response.data.results || [];
        const formattedWorkspaces = workspaceData.map((ws) => ({
          id: ws.id.toString(),
          name: ws.company_name || `Workspace ${ws.id}`,
        }));
        setWorkspaces(formattedWorkspaces);
        const selectedWsFromCookie = getSelectedWorkspaceFromCookies();
        const cookieWsExists = formattedWorkspaces.some(
          (ws) => ws.id === selectedWsFromCookie.id
        );
        let wsToSet = "";
        if (cookieWsExists) {
          wsToSet = selectedWsFromCookie.id;
        } else if (formattedWorkspaces.length > 0) {
          wsToSet = formattedWorkspaces[0].id;
        }
        setWorkspaceId(wsToSet);
      } else {
        triggerAlert(
          "error",
          "Error",
          response?.data?.message || "Failed to fetch workspaces"
        );
        setWorkspaceId("");
      }
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      triggerAlert(
        "error",
        "Error",
        "You don’t have access to any workspaces. Please contact your administrator."
      );
      setWorkspaceId("");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceData();
  }, []);

  const sendInvoice = async (id) => {
    let element;
    if (activeInvoiceTab === "month_wise") {
      element = document.getElementById("month-wise-invoice-content");
    } else {
      element = document.getElementById("invoice-preview-card-data");
    }

    if (!element) {
      console.error("Invoice preview element not found!");
      triggerAlert("error", "", "Invoice preview element not found");
      return;
    }

    try {
      setIsSendingInvoice(true);

      // --- START OF CHANGES ---

      // 1. Define the PDF width (A4 width in points is a good standard).
      const pdfWidthInPoints = 595;
      // 2. Get the full height of the invoice element.
      const pdfHeightInPoints = element.scrollHeight;

      const pdfOptions = {
        margin: 10,
        filename: `invoice_${id}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2, // Using scale 2 is often a good balance of quality and file size.
          useCORS: true,
        },
        jsPDF: {
          unit: "pt", // Use 'points' as the unit for consistency.
          // 3. Set a custom format [width, height] instead of 'a4'.
          format: [pdfWidthInPoints, pdfHeightInPoints],
          orientation: "portrait",
        },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      };

      const pdfDataUri = await html2pdf()
        .set(pdfOptions)
        .from(element)
        .output("datauristring");

      // --- END OF CHANGES ---

      const base64String = pdfDataUri.split(",")[1];

      // This part of your logic seems to have a small duplication.
      // I've kept your original logic, but you might want to review if both API calls are needed.
      if (activeInvoiceTab === "month_wise") {
        const selectedMonth =
          watch("selected_month") || (new Date().getMonth() + 1).toString();
        const currentYear = new Date().getFullYear();
        const payload = {
          month: selectedMonth,
          year: currentYear,
          workspace_id: workspaceId,
          type: "send_invoice",
          pdf_base_64: base64String,
        };
        await sendInvoiceBilling(payload);
      }

      // This call happens for both month-wise and date-wise tabs.
      const emailPayload = {
        invoice_id: id,
        type: "send_invoice",
        pdf_base_64: base64String,
        // Assuming workspaceId is the correct customer_id here.
        // If not, you might need to adjust this.
        customer_id: workspaceId,
      };
      // await sendEmailbase64(emailPayload);

      triggerAlert("success", "", "Invoice sent successfully!");
    } catch (error) {
      console.error("Error sending invoice:", error);
      triggerAlert("error", "", "Failed to send invoice");
    } finally {
      setIsSendingInvoice(false);
    }
  };

  const handleDownload = () => {
    setActionLoading(true);
    const elementToPrint = document.getElementById("invoice-preview-card-data");
    const monthWiseElement = document.getElementById(
      "month-wise-invoice-content"
    );
    if (activeInvoiceTab === "month_wise" && monthWiseElement) {
      downloadInvoiceAsPDF(monthWiseElement);
    } else if (elementToPrint && selectedInvoice) {
      downloadInvoiceAsPDF(elementToPrint);
    } else {
      triggerAlert(
        "warning",
        "",
        "No invoice selected or content found to download."
      );
    }
    setTimeout(() => setActionLoading(false), 1000);
  };

  const getPrintContent = () => {
    if (activeInvoiceTab === "month_wise") {
      return document.getElementById("month-wise-invoice-content");
    }
    return invoiceToPrintRef.current;
  };

  const reactToPrintHandle = useReactToPrint({
    content: getPrintContent,
    onBeforeGetContent: () => setPrintInvoice(true),
    onAfterPrint: () => setPrintInvoice(false),
  });

  const handlePrintWrapper = () => {
    const content = getPrintContent();
    if (!content) {
      triggerAlert(
        "warning",
        "",
        "No invoice selected or content found to print."
      );
      return;
    }
    reactToPrintHandle();
  };

  useEffect(() => {
    if (selectedInvoice && activeInvoiceTab !== "month_wise") {
      let calculatedPlansCost = 0;
      let calculatedTotalCost = 0;
      const invoiceTaxPercentage = parseFloat(selectedInvoice.plan_tax) || 0;
      if (
        selectedInvoice.inv_subject &&
        selectedInvoice.inv_subject.toLowerCase().includes("plan purchase")
      ) {
        if (Array.isArray(selectedInvoice.plan_option)) {
          selectedInvoice.plan_option.forEach((plan) => {
            calculatedPlansCost += parseFloat(plan.total) || 0;
          });
        }
      } else {
        calculatedPlansCost = parseFloat(selectedInvoice.invoice_amount) || 0;
      }
      const taxAmount = (calculatedPlansCost * invoiceTaxPercentage) / 100;
      calculatedTotalCost = calculatedPlansCost + taxAmount;
      setTotalPlansCost(calculatedPlansCost);
      setInvoiceTotalCost(calculatedTotalCost);
    }
  }, [selectedInvoice, activeInvoiceTab]);

  const isInvoiceVisible =
    showInvoiceButtons &&
    ((activeInvoiceTab === "month_wise" && invoiceData) ||
      (activeInvoiceTab !== "month_wise" && selectedInvoice));

  const currentInvoiceId =
    activeInvoiceTab === "month_wise"
      ? invoiceData?.recharge_invoices?.[0]?.invoice_id
      : selectedInvoice?.invoice_id;

  const InvoiceActionButtons = ({
    onSend,
    onDownload,
    onPrint,
    isSending,
    isLoading,
    isPrinting,
    canSend,
  }) => (
    <div className="col-xl-12 col-md-4 col-12 invoice-actions">
      <div className="">
        <div className="card-body">
          <div className="d-flex justify-content-center gap-3 ">
            <button
              className="btn btn-outline-warning px-5 waves-effect waves-light"

              onClick={onSend}
              disabled={isSending}
            >
              <span className="d-flex align-items-center justify-content-center text-nowrap">
                {isSending ? (
                  <>
                    <div
                      className="spinner-border spinner-border-sm me-1"
                      role="status"
                    ></div>
                    <span className="visually-hidden">Loading...</span>
                  </>
                ) : (
                  <i className="ti ti-send ti-xs me-1"></i>
                )}
                Send Invoice
              </span>
            </button>
            <button
              className="btn btn-outline-success px-5 waves-effect waves-light"

              onClick={onDownload}
              disabled={isLoading}
            >
              <span className="d-flex align-items-center justify-content-center text-nowrap">
                {isLoading ? (
                  <>
                    <div
                      className="spinner-border spinner-border-sm me-1"
                      role="status"
                    ></div>
                    <span className="visually-hidden">Loading...</span>
                  </>
                ) : (
                  <i className="ti ti-download ti-xs me-1"></i>
                )}
                Download
              </span>
            </button>
            <button
              className="btn btn-outline-primary px-5 waves-effect waves-light"

              onClick={onPrint}
              disabled={isPrinting}
            >
              <span className="d-flex align-items-center justify-content-center text-nowrap">
                {isPrinting ? (
                  <>
                    <div
                      className="spinner-border spinner-border-sm me-1"
                      role="status"
                    ></div>
                    <span className="visually-hidden">Loading...</span>
                  </>
                ) : (
                  <i className="ti ti-print ti-xs me-1"></i>
                )}
                Print
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div id="content-page" className="content-page">
      <div className="container">
        <PageTitle
          heading="Invoice"
          title="Invoice | Pay As You Go"
          description="Premium Multipurpose Admin & Dashboard Template"
        />
        <div className="row invoice-not-to-print">
          <div className="col-xl-12">
            <div className="card">
              <div className="card-body">
                <div className="row mb-3">
                  <div className="mb-3 col-md-3">
                    <label className="form-label" htmlFor="workspaceSelect">
                      Select Workspace
                    </label>
                    <select
                      className="form-select"
                      id="workspaceSelect"
                      value={workspaceId}
                      onChange={handleWorkspaceChange}
                      style={selectStyles}
                    >
                      {workspaces.length === 0 && (
                        <option value="">Loading workspaces...</option>
                      )}
                      {workspaces.map((ws) => (
                        <option key={ws.id} value={ws.id}>
                          {ws.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <ul className="nav nav-pills nav-date" role="tablist">
                  <li
                    className="nav-item waves-effect waves-light"
                    role="presentation"
                  >
                    <a
                      className={`nav-link ${activeInvoiceTab === "month_wise" ? "active" : ""
                        }`}
                      onClick={() => handleTabChange("month_wise")}
                      role="tab"
                      aria-selected={activeInvoiceTab === "month_wise"}
                    >
                      <span className="d-block d-sm-none">
                        <i className="fas fa-home"></i>
                      </span>
                      <span className="d-none d-sm-block">Month Wise</span>
                    </a>
                  </li>
                  <li
                    className="nav-item waves-effect waves-light"
                    role="presentation"
                  >
                    {/* <a
                      className={`nav-link mx-3 ${[
                        "date_wise",
                        "current_month",
                        "last_3_month",
                        "last_6_month",
                      ].includes(activeInvoiceTab)
                        ? "active"
                        : ""
                        }`}
                      onClick={() => handleTabChange("date_wise")}
                      role="tab"
                      aria-selected={activeInvoiceTab === "date_wise"}
                    >
                      <span className="d-block d-sm-none">
                        <i className="far fa-user"></i>
                      </span>
                      <span className="d-none d-sm-block">Date Wise</span>
                    </a> */}
                  </li>
                </ul>
                <div className="tab-content p-3 text-muted">
                  <div
                    className={`tab-pane ${activeInvoiceTab === "month_wise" ? "active show" : ""
                      }`}
                    id="month-wise-tab"
                    role="tabpanel"
                  >
                    <form onSubmit={handleSearch}>
                      <div className="row align-items-end">
                        <div className="col-md-3">
                          <label className="form-label" htmlFor="selectYear">
                            Select Year
                          </label>
                          <select
                            className="form-select"
                            id="selectYear"
                            aria-label="Select Year"
                            {...register("selected_year", {
                              required:
                                activeInvoiceTab === "month_wise"
                                  ? "Year is required"
                                  : false,
                            })}
                            style={selectStyles}
                          >
                            <option value="">Select Year</option>
                            {[...Array(10).keys()].map((i) => {
                              const year = new Date().getFullYear() - i;
                              return (
                                <option key={year} value={year}>
                                  {year}
                                </option>
                              );
                            })}
                          </select>
                          {errors.selected_year && (
                            <div
                              style={{
                                color: "red",
                                fontSize: "14px",
                                marginTop: "5px",
                              }}
                            >
                              {errors.selected_year.message}
                            </div>
                          )}
                        </div>
                        <div className="col-md-3">
                          <label className="form-label" htmlFor="selectMonth">
                            Select Month
                          </label>
                          <select
                            className="form-select"
                            id="selectMonth"
                            aria-label="Select Month"
                            {...register("selected_month", {
                              required:
                                activeInvoiceTab === "month_wise"
                                  ? "Month is required"
                                  : false,
                            })}
                            style={selectStyles}
                            disabled={!selectedYear}
                          >
                            <option value="">
                              {!selectedYear ? "Select Year First" : "Select Month"}
                            </option>
                            {selectedYear && [...Array(12).keys()].map((i) => {
                              const monthIndex = i + 1;
                              const currentYear = new Date().getFullYear();
                              const currentMonth = new Date().getMonth() + 1;
                              const selectedYearNum = parseInt(selectedYear, 10);

                              // If selected year is current year, only show months up to current month
                              // If selected year is past year, show all months
                              const shouldShowMonth = selectedYearNum < currentYear ||
                                (selectedYearNum === currentYear && monthIndex <= currentMonth);

                              if (!shouldShowMonth) return null;

                              return (
                                <option key={monthIndex} value={monthIndex}>
                                  {new Date(0, i).toLocaleString("default", {
                                    month: "long",
                                  })}
                                </option>
                              );
                            })}
                          </select>
                          {errors.selected_month && (
                            <div
                              style={{
                                color: "red",
                                fontSize: "14px",
                                marginTop: "5px",
                              }}
                            >
                              {errors.selected_month.message}
                            </div>
                          )}
                        </div>
                        <div className="col-md-2 mt-4">
                          <button
                            type="submit"
                            className="btn btn-warning px-4 btn-rounded waves-effect waves-light"
                            disabled={isLoading}
                          >
                            {isLoading ? "Searching..." : "Search"}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                  <div
                    className={`tab-pane ${activeInvoiceTab === "date_wise" ||
                      activeInvoiceTab === "current_month" ||
                      activeInvoiceTab === "last_3_month" ||
                      activeInvoiceTab === "last_6_month"
                      ? "active show"
                      : ""
                      }`}
                    id="profile-1"
                    role="tabpanel"
                  >
                    <form>
                      <div className="row align-items-center">
                        <div className="col-md-3 mb-3 d-flex flex-column position-relative">
                          <label htmlFor="fromDate" className="form-label">
                            From
                          </label>
                          <i
                            className="mdi mdi-calendar"
                            style={{
                              position: "absolute",
                              top: "50%",
                              right: "20px",
                              transform: "translateY(-2%)",
                              zIndex: "1",
                              fontSize: "24px",
                              cursor: "pointer",
                              color: "#6c757d",
                            }}
                            onClick={handleClickDatepickerFromIcon}
                          ></i>
                          <Controller
                            control={control}
                            name="period_start"
                            render={({ field }) => (
                              <DatePicker
                                className="px-2 form-control"
                                placeholderText="MM/DD/YYYY"
                                selected={field.value}
                                onChange={(date) => {
                                  field.onChange(date);
                                  setPeriodStart(date);
                                  setMinEndDate(date);
                                  if (date) clearErrors("period_start");
                                }}
                                showMonthDropdown
                                showYearDropdown
                                maxDate={new Date()}
                                autoComplete="off"
                                ref={datepickerfromRef}
                              />
                            )}
                          />
                          {errors.period_start && (
                            <div
                              style={{
                                color: "red",
                                fontSize: "14px",
                                marginTop: "5px",
                                position: "absolute",
                                bottom: "-25px",
                              }}
                            >
                              {errors.period_start.message}
                            </div>
                          )}
                        </div>
                        <div className="col-md-3 mb-3 d-flex flex-column position-relative">
                          <label htmlFor="toDate" className="form-label">
                            To
                          </label>
                          <i
                            className="mdi mdi-calendar"
                            style={{
                              position: "absolute",
                              top: "50%",
                              right: "20px",
                              transform: "translateY(-2%)",
                              zIndex: "1",
                              fontSize: "24px",
                              cursor: "pointer",
                              color: "#6c757d",
                            }}
                            onClick={handleClickDatepickerToIcon}
                          ></i>
                          <Controller
                            control={control}
                            name="period_end"
                            render={({ field }) => (
                              <DatePicker
                                className="px-2 form-control"
                                placeholderText="MM/DD/YYYY"
                                selected={field.value}
                                onChange={(date) => {
                                  field.onChange(date);
                                  setPeriodEnd(date);
                                  if (date) clearErrors("period_end");
                                }}
                                showMonthDropdown
                                showYearDropdown
                                maxDate={new Date()}
                                minDate={minEndDate}
                                autoComplete="off"
                                ref={datepickerToRef}
                              />
                            )}
                          />
                          {errors.period_end && (
                            <div
                              style={{
                                color: "red",
                                fontSize: "14px",
                                marginTop: "5px",
                                position: "absolute",
                                bottom: "-25px",
                              }}
                            >
                              {errors.period_end.message}
                            </div>
                          )}
                        </div>
                        <div className="col-md-1 mt-3">
                          <button
                            type="button"
                            className="btn btn-warning px-2 btn-rounded waves-effect waves-light"
                            onClick={handleSearch}
                            disabled={isLoading}
                          >
                            {isLoading ? "Searching..." : "Search"}
                          </button>
                        </div>
                        <div className="col-md-5 mt-3">
                          <div className="d-flex gap-2 flex-wrap">
                            <button
                              type="button"
                              className="btn btn-primary btn-rounded waves-effect waves-light px-2"
                              onClick={() => handleTabChange("current_month")}
                            >
                              Current Month
                            </button>
                            <button
                              type="button"
                              className="btn btn-success btn-rounded waves-effect waves-light px-2"
                              onClick={() => handleTabChange("last_3_month")}
                            >
                              Last Three Months
                            </button>
                            <button
                              type="button"
                              className="btn btn-info btn-rounded waves-effect waves-light px-2"
                              onClick={() => handleTabChange("last_6_month")}
                            >
                              Last Six Months
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
                {!isLoading &&
                  activeInvoiceTab === "month_wise" &&
                  invoiceData &&
                  showInvoiceButtons && (
                    <>
                      {/* Action Buttons at Top */}
                      <div className="row invoice-not-to-print mt-3">
                        <InvoiceActionButtons
                          onSend={() => {
                            if (currentInvoiceId) {
                              sendInvoice(currentInvoiceId);
                            } else {
                              triggerAlert("error", "", "Cannot find invoice ID to send.");
                            }
                          }}
                          onDownload={handleDownload}
                          onPrint={handlePrintWrapper}
                          isSending={isSendingInvoice}
                          isLoading={actionLoading}
                          isPrinting={printInvoice}
                          canSend={!!currentInvoiceId}
                          isDateWise={false}
                          isMonthWise={true}
                        />
                      </div>

                      <div className="row mt-3">
                        <div className="col-12">
                          <div id="month-wise-invoice-content">
                            <div className="container" style={{ maxWidth: "900px" }}>
                              <div className="py-5 px-4 my-4 mt-0 pt-0">
                                <div
                                  className="bg-white border border-2 border-warning rounded p-5 shadow-none pt-4"
                                  style={{
                                    WebkitPrintColorAdjust: "exact",
                                    printColorAdjust: "exact",
                                  }}
                                >
                                  {/* Header */}
                                  <div className="mb-4 pb-3 border-bottom border-2 border-warning text-center">
                                    <img
                                      src="/assets/images/logo.svg"
                                      className="img-fluid shadow-none pb-2"
                                      width="300"
                                      alt="Vitel Global Logo"
                                    />
                                  </div>

                                  {/* Invoice Header */}
                                  <div className="d-flex justify-content-between align-items-start mb-4">
                                    <div>
                                      <h2 className="fs-1 fw-bold text-warning mb-1">INVOICE</h2>
                                      <div className="text-black" style={{ lineHeight: "1.8" }}>
                                        <div>
                                          <span className="fw-semibold">Invoice # :</span> {invoiceData?.monthly_invoice || "N/A"}
                                        </div>
                                        <div>
                                          <span className="fw-semibold">Date :</span>{" "}
                                          {(() => {
                                            const dateStr = invoiceData.mrc_data?.[0]?.invoice_date ||
                                              invoiceData.nrc_data?.[0]?.invoice_date ||
                                              invoiceData.recharge_invoices?.[0]?.invoice_date;
                                            return formatDateYYYYMMDD(dateStr);
                                          })()}
                                        </div>
                                        <div>
                                          <span className="fw-semibold">Period :</span> {invoiceData?.billing_date || "N/A"}
                                        </div>
                                        <div>
                                          <span className="fw-semibold">Status :</span>{" "}
                                          <span className="badge bg-warning text-white">Paid</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-end">
                                      <h5 className="fw-semibold mb-1 text-warning">Total Amount</h5>
                                      <p className="display-6 fw-bold text-black mb-0">
                                        ${invoiceData.total_amount !== undefined ? parseFloat(invoiceData.total_amount).toFixed(2) : "0.00"}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Bill To */}
                                  <div className="mb-4">
                                    <h5 className="fw-bold text-warning mb-2">Bill To :</h5>
                                    <div className="text-black" style={{ lineHeight: "1.8" }}>
                                      <p className="fw-semibold mb-0">
                                        {invoiceData.personal_information
                                          ? `${invoiceData.personal_information.first_name || ""} ${invoiceData.personal_information.last_name || ""}`.trim() || "N/A"
                                          : "N/A"}
                                      </p>
                                      <p className="mb-0">{invoiceData.personal_information?.company_name || "N/A"}</p>
                                      <p className="mb-0">{invoiceData.personal_information?.email || "N/A"}</p>
                                      <p className="mb-0">{invoiceData.personal_information?.phone_number || "N/A"}</p>
                                      <p className="mb-0">295 Durham Avenue, Suite D, South Plainfield, TX, US - 07080</p>
                                    </div>
                                  </div>

                                  {/* Summary */}
                                  <div className="row text-center mb-4 pb-3 pt-3 border-bottom border-top border-warning" style={{ fontSize: "15px" }}>
                                    <div className="col">
                                      <p className="text-warning mb-1 fw-semibold">MRC</p>
                                      <p className="fw-bold fs-6 text-black mb-0">${parseFloat(invoiceData.total_mrc || 0).toFixed(2)}</p>
                                    </div>
                                    <div className="col">
                                      <p className="text-warning mb-1 fw-semibold">NRC</p>
                                      <p className="fw-bold fs-6 text-black mb-0">${parseFloat(invoiceData.total_nrc || 0).toFixed(2)}</p>
                                    </div>
                                    <div className="col">
                                      <p className="text-warning mb-1 fw-semibold">Funds Added</p>
                                      <p className="fw-bold fs-6 text-black mb-0">${parseFloat(invoiceData.fundes_added || 0).toFixed(2)}</p>
                                    </div>
                                    <div className="col">
                                      <p className="text-warning mb-1 fw-semibold">Wallet Amount</p>
                                      <p className="fw-bold fs-6 text-black mb-0">${parseFloat(invoiceData.current_balance || 0).toFixed(2)}</p>
                                    </div>
                                  </div>

                                  {/* MRC Table */}
                                  {invoiceData.mrc_data && invoiceData.mrc_data.length > 0 && (
                                    <div className="mb-4">
                                      <h6 className="text-uppercase fw-bold text-warning mb-2">
                                        Monthly Recurring Charges (MRC)
                                      </h6>
                                      <div className="table-responsive">
                                        <table className="table table-sm align-middle">
                                          <thead className="border-bottom border-2 border-warning text-warning fw-semibold" style={{ fontSize: "15px" }}>
                                            <tr>
                                              <th>Service</th>
                                              <th className="text-center">QTY</th>
                                              <th>Billing Date</th>
                                              <th className="text-end">Rate</th>
                                              <th className="text-end">Tax</th>
                                              <th className="text-end">Total</th>
                                            </tr>
                                          </thead>
                                          <tbody className="text-black">
                                            {(() => {
                                              // Group MRC data by inv_subject
                                              const groupedData = invoiceData.mrc_data.reduce((acc, item) => {
                                                const key = item.inv_subject || "N/A";
                                                if (!acc[key]) {
                                                  acc[key] = {
                                                    inv_subject: key,
                                                    qty: 0,
                                                    inv_from_date: item.inv_from_date,
                                                    inv_to_date: item.inv_to_date,
                                                    unit_price: 0,
                                                    tax_amount: item.tax_amount || 0,
                                                    total_amount: 0,
                                                  };
                                                }
                                                acc[key].qty += 1;
                                                acc[key].unit_price += item.unit_price || 0;
                                                acc[key].total_amount += item.total_amount || 0;
                                                return acc;
                                              }, {});

                                              return Object.values(groupedData).map((item, index) => (
                                                <tr key={index}>
                                                  <td>{item.inv_subject}</td>
                                                  <td className="text-center">{item.qty}</td>
                                                  <td>
                                                    {formatDateYYYYMMDD(item.inv_from_date)} TO {formatDateYYYYMMDD(item.inv_to_date)}
                                                  </td>
                                                  <td className="text-end">${item.unit_price.toFixed(2)}</td>
                                                  <td className="text-end">{item.tax_amount.toFixed(2)}%</td>
                                                  <td className="text-end">${item.total_amount.toFixed(2)}</td>
                                                </tr>
                                              ));
                                            })()}
                                            <tr className="border-top border-2 border-light">
                                              <td colSpan="5" className="text-end text-warning fw-bold">Subtotal:</td>
                                              <td className="text-end text-warning fw-bold">
                                                ${invoiceData.mrc_data.reduce((sum, item) => sum + (item.total_amount || 0), 0).toFixed(2)}
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  )}

                                  {/* NRC Table */}
                                  {invoiceData.nrc_data && invoiceData.nrc_data.length > 0 && (
                                    <div className="mb-4">
                                      <h6 className="text-uppercase fw-bold text-warning mb-2">
                                        Non-Recurring Charges (NRC)
                                      </h6>
                                      <div className="table-responsive">
                                        <table className="table table-sm align-middle">
                                          <thead className="border-bottom border-2 border-warning text-warning fw-semibold" style={{ fontSize: "15px" }}>
                                            <tr>
                                              <th>Service</th>
                                              <th className="text-center">QTY</th>
                                              <th>Billing Date</th>
                                              <th className="text-end">Rate</th>
                                              <th className="text-end">Tax</th>
                                              <th className="text-end">Total</th>
                                            </tr>
                                          </thead>
                                          <tbody className="text-black">
                                            {(() => {
                                              // Group NRC data by inv_subject
                                              const groupedData = invoiceData.nrc_data.reduce((acc, item) => {
                                                const key = item.inv_subject || "N/A";
                                                if (!acc[key]) {
                                                  acc[key] = {
                                                    inv_subject: key,
                                                    qty: 0,
                                                    inv_from_date: item.inv_from_date,
                                                    inv_to_date: item.inv_to_date,
                                                    unit_price: 0,
                                                    tax_amount: item.tax_amount || 0,
                                                    total_amount: 0,
                                                  };
                                                }
                                                acc[key].qty += 1;
                                                acc[key].unit_price += item.unit_price || 0;
                                                acc[key].total_amount += item.total_amount || 0;
                                                return acc;
                                              }, {});

                                              return Object.values(groupedData).map((item, index) => (
                                                <tr key={index}>
                                                  <td>{item.inv_subject}</td>
                                                  <td className="text-center">{item.qty}</td>
                                                  <td>
                                                    {formatDateYYYYMMDD(item.inv_from_date)} TO {formatDateYYYYMMDD(item.inv_to_date)}
                                                  </td>
                                                  <td className="text-end">${item.unit_price.toFixed(2)}</td>
                                                  <td className="text-end">{item.tax_amount.toFixed(2)}%</td>
                                                  <td className="text-end">${item.total_amount.toFixed(2)}</td>
                                                </tr>
                                              ));
                                            })()}
                                            <tr className="border-top border-2 border-light">
                                              <td colSpan="5" className="text-end fw-bold text-warning">Subtotal:</td>
                                              <td className="text-end fw-bold text-warning">
                                                ${invoiceData.nrc_data.reduce((sum, item) => sum + (item.total_amount || 0), 0).toFixed(2)}
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  )}

                                  {/* Credits Table */}
                                  {recharge_invoices && recharge_invoices.length > 0 && (
                                    <div className="mb-4">
                                      <h6 className="text-uppercase fw-bold text-warning mb-2">Funds Added</h6>
                                      <div className="table-responsive">
                                        <table className="table table-sm align-middle">
                                          <thead className="border-bottom border-2 border-warning text-warning fw-semibold" style={{ fontSize: "15px" }}>
                                            <tr>
                                              <th>Service</th>
                                              <th>Invoice No</th>
                                              <th>Date</th>
                                              <th className="text-end">Total</th>
                                            </tr>
                                          </thead>
                                          <tbody className="text-black">
                                            {recharge_invoices.map((invoice, index) => (
                                              <tr key={invoice.invoice_id}>
                                                <td>{invoice.inv_subject || "N/A"}</td>
                                                <td>{invoice.invoice_number || "N/A"}</td>
                                                <td>
                                                  {formatDateYYYYMMDD(invoice.inv_from_date)}
                                                </td>
                                                <td className="text-end">${parseFloat(invoice.invoice_amount || 0).toFixed(2)}</td>
                                              </tr>
                                            ))}
                                            <tr className="border-top border-2 border-light">
                                              <td colSpan="3" className="text-end fw-bold text-warning">Total:</td>
                                              <td className="text-end fw-bold text-warning">
                                                ${recharge_invoices.reduce((sum, inv) => sum + parseFloat(inv.invoice_amount || 0), 0).toFixed(2)}
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  )}

                                  {/* Footer */}
                                  <div className="pt-4 border-top border-2 mt-5 border-warning text-center">
                                    <p className="text-warning mb-1">
                                      For questions or concerns, contact us at{" "}
                                      <a
                                        href="mailto:accounts@vitelglobal.com"
                                        className="fw-semibold text-warning text-decoration-underline"
                                      >
                                        accounts@vitelglobal.com
                                      </a>{" "}
                                      or{" "}
                                      <a
                                        href="tel:732-444-3132"
                                        className="fw-semibold text-warning text-decoration-underline"
                                      >
                                        732-444-3132
                                      </a>
                                    </p>
                                    <p className="text-warning fw-semibold mb-0">
                                      Thank you for choosing Vitel Global Communications.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
              </div>
            </div>
          </div>
          {isLoading && (
            <div className="text-center my-3">
              <Loader />
            </div>
          )}
          {!isLoading &&
            showInvoiceButtons &&
            activeInvoiceTab !== "month_wise" && (
              <div className="row invoice-not-to-print">
                <div className="col-xl-12">
                  <div className="card">
                    <div className="card-body">
                      <div className="col-md-12">
                        <div className="button-items">
                          {invoices && invoices.length === 0 && hasDataLoaded[activeInvoiceTab] ? (
                            <p className="fw-semibold d-flex justify-content-center align-items-center">
                              No invoices found for the selected criteria.
                            </p>
                          ) : (
                            invoices.map((invoice) => (
                              <button
                                type="button"
                                key={invoice.invoice_id}
                                onClick={() => {
                                  setIsLoadingInvoice(true);
                                  setSelectedInvoice(invoice);
                                  setTimeout(
                                    () => setIsLoadingInvoice(false),
                                    300
                                  );
                                }}
                                className={`btn btn-info btn-rounded waves-effect waves-light ${selectedInvoice?.invoice_id ===
                                  invoice.invoice_id
                                  ? "active"
                                  : ""
                                  } mb-2`}
                                style={{ marginRight: "10px" }}
                              >
                                INVOICE # {invoice.invoice_number}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          {!isLoading &&
            activeInvoiceTab !== "month_wise" &&
            selectedInvoice &&
            showInvoiceButtons && (
              <div>
                {isLoadingInvoice ? (
                  <div className="text-center my-3">
                    <Loader />
                  </div>
                ) : (
                  <>
                    {/* Action Buttons at Top */}
                    <div className="row invoice-not-to-print mb-3">
                      <InvoiceActionButtons
                        onSend={() => {
                          if (currentInvoiceId) {
                            sendInvoice(currentInvoiceId);
                          } else {
                            triggerAlert("error", "", "Cannot find invoice ID to send.");
                          }
                        }}
                        onDownload={handleDownload}
                        onPrint={handlePrintWrapper}
                        isSending={isSendingInvoice}
                        isLoading={actionLoading}
                        isPrinting={printInvoice}
                        canSend={!!currentInvoiceId}
                        isDateWise={activeInvoiceTab === "date_wise"}
                        isMonthWise={activeInvoiceTab === "month_wise"}
                      />
                    </div>

                    <div className="row">
                      <div className="col-sm-12">
                        <div
                          id="invoice-preview-card-data"
                          ref={invoiceToPrintRef}
                          className="card"
                          style={{
                            border: "2px solid #FF9800",
                            position: "relative",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform:
                                "translate(-50%, -50%) rotate(-35deg)",
                              fontSize: "clamp(30px, 10vw, 80px)",
                              color: "rgba(0, 0, 0, 0.07)",
                              zIndex: "0",
                              pointerEvents: "none",
                              whiteSpace: "nowrap",
                              fontWeight: "bold",
                              textAlign: "center",
                              width: "100%",
                            }}
                          >
                            VITEL GLOBAL COMMUNICATION
                          </div>
                          <div
                            className="card-body"
                            style={{ position: "relative", zIndex: 1 }}
                          >
                            <div className="row mb-4">
                              <div className="col-6">
                                <h4
                                  className="mb-0"
                                  style={{ color: "#ed7d31", fontWeight: "bold" }}
                                >
                                  Vitel Global Communications LLC,
                                </h4>
                                <p
                                  className="mb-0 fw-500"
                                  style={invoiceStyles.noWrap}
                                >
                                  295 Durham Avenue, Suite D, South Plainfield,
                                  NJ-07080
                                  <br />
                                  Phone: # 7324443132
                                  <br />
                                  Email: info@vitelglobal.com
                                </p>
                              </div>
                              <div className="col-6">
                                <a
                                  href="#"
                                  onClick={(e) => e.preventDefault()}
                                  className="d-flex align-items-center justify-content-end gap-2"
                                >
                                  <img
                                    src="/assets/images/sms.png"
                                    className="img-fluid"
                                    width="250"
                                    alt="Vitel Global Logo"
                                  />
                                </a>
                              </div>
                            </div>
                            <div className="row mb-4 justify-content-between">
                              <h2
                                className="text-center"
                                style={{
                                  color: "#ed7d31",
                                  marginBottom: 15,
                                  fontWeight: "bold",
                                  webkitPrintColorAdjust: "exact",
                                }}
                              >
                                INVOICE
                              </h2>
                              <div className="col-lg-5 col-md-6 col-12 mb-3 mb-md-0">
                                <div className="card h-100">
                                  <div
                                    className="card-header d-flex justify-content-between p-2"
                                    style={{
                                      background: "#ed7d31",
                                      webkitPrintColorAdjust: "exact",
                                      borderRadius: 0,
                                    }}
                                  >
                                    <div className="header-title">
                                      <h4
                                        className="card-title m-0"
                                        style={{ color: "#fff" }}
                                      >
                                        SOLD TO
                                      </h4>
                                    </div>
                                  </div>
                                  <div
                                    className="card-body pt-0 px-0 pb-0"
                                    style={{
                                      border: "2px solid #ec7d31",
                                      borderTop: 0,
                                      borderRadius: "0 0 5px 5px",
                                    }}
                                  >
                                    <div
                                      className="table-responsive-sm"
                                      style={{ padding: "3px 10px" }}
                                    >
                                      <table className="table table-borderless mb-0">
                                        <tbody>
                                          <tr>
                                            <th
                                              scope="row"
                                              width={120}
                                              className="fw-bold ps-0"
                                            >
                                              Account No:
                                            </th>
                                            <td style={invoiceStyles.wrap}>
                                              {selectedInvoice.Card_number ||
                                                "0.00"}
                                            </td>
                                          </tr>
                                          <tr>
                                            <th
                                              scope="row"
                                              className="fw-bold ps-0"
                                            >
                                              Workspace Name:
                                            </th>
                                            <td style={invoiceStyles.wrap}>
                                              {selectedInvoice.company_name ||
                                                "N/A"}
                                            </td>
                                          </tr>
                                          <tr>
                                            <th
                                              scope="row"
                                              className="fw-bold ps-0"
                                            >
                                              Contact Name:
                                            </th>
                                            <td style={invoiceStyles.wrap}>
                                              {selectedInvoice.first_name || ""}{" "}
                                              {selectedInvoice.last_name || ""}
                                            </td>
                                          </tr>
                                          <tr>
                                            <th
                                              scope="row"
                                              className="fw-bold ps-0"
                                            >
                                              Email:
                                            </th>
                                            <td style={invoiceStyles.wrap}>
                                              {selectedInvoice.email || "N/A"}
                                            </td>
                                          </tr>
                                          <tr>
                                            <th
                                              scope="row"
                                              className="fw-bold ps-0"
                                            >
                                              Address:
                                            </th>
                                            <td style={invoiceStyles.textCell}>
                                              {selectedInvoice.address || "N/A"}
                                            </td>
                                          </tr>
                                          <tr>
                                            <th
                                              scope="row"
                                              className="fw-bold ps-0"
                                            >
                                              Phone:
                                            </th>
                                            <td style={invoiceStyles.wrap}>
                                              {selectedInvoice.phone || "N/A"}
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="col-lg-5 col-md-6 col-12">
                                <div className="card h-100">
                                  <div
                                    className="card-header d-flex justify-content-center p-2"
                                    style={{
                                      borderRadius: 0,
                                      background: "#ed7d31",
                                      webkitPrintColorAdjust: "exact",
                                    }}
                                  >
                                    <div className="header-title">
                                      <h4
                                        className="card-title text-center m-0"
                                        style={{ color: "#fff" }}
                                      >
                                        INVOICE SUMMARY
                                      </h4>
                                    </div>
                                  </div>
                                  <div
                                    className="card-body pt-0 px-0 pb-0"
                                    style={{
                                      border: "2px solid #ec7d31",
                                      borderTop: 0,
                                      borderRadius: "0 0 5px 5px",
                                    }}
                                  >
                                    <div
                                      className="table-responsive-sm"
                                      style={{ padding: "3px 10px" }}
                                    >
                                      <table className="table table-borderless mb-0">
                                        <tbody>
                                          <tr>
                                            <th
                                              scope="row"
                                              width={120}
                                              className="fw-bold ps-0"
                                            >
                                              Invoice No:
                                            </th>
                                            <td style={invoiceStyles.wrap}>
                                              {selectedInvoice.invoice_number ||
                                                "N/A"}
                                            </td>
                                          </tr>
                                          <tr>
                                            <th
                                              scope="row"
                                              className="fw-bold ps-0"
                                            >
                                              Invoice Date:
                                            </th>
                                            <td style={invoiceStyles.wrap}>
                                              {selectedInvoice.invoice_date
                                                ? formatDateTime(
                                                  selectedInvoice.invoice_date,
                                                  "dd-mm-yyyy"
                                                )
                                                : "N/A"}
                                            </td>
                                          </tr>
                                          <tr>
                                            <th
                                              scope="row"
                                              className="fw-bold ps-0"
                                            >
                                              Plan Purchased:
                                            </th>
                                            <td style={invoiceStyles.wrap}>
                                              {selectedInvoice.inv_subject ? selectedInvoice.inv_subject.replace(/^Plan Purchase:\s*/, '') : "N/A"}
                                            </td>

                                          </tr>
                                          <tr>
                                            <th
                                              scope="row"
                                              className="fw-bold ps-0"
                                            >
                                              Due Date:
                                            </th>
                                            <td style={invoiceStyles.wrap}>
                                              {selectedInvoice.Due_Date
                                                ? formatDateTime(
                                                  selectedInvoice.Due_Date,
                                                  "dd-mm-yyyy"
                                                )
                                                : "N/A"}
                                            </td>
                                          </tr>
                                          <tr>
                                            <th
                                              scope="row"
                                              className="fw-bold ps-0"
                                            >
                                              Auto Renewal:
                                            </th>
                                            <td style={invoiceStyles.wrap}>
                                              {selectedInvoice.auto_renewal
                                                ? "Yes"
                                                : "No"}
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="row" style={{ marginTop: 50 }}>
                              <div className="col-sm-12">
                                <div
                                  className="d-flex align-items-start justify-content-between"
                                  style={{
                                    background: "#ed7d31",
                                    webkitPrintColorAdjust: "exact",
                                    padding: "6px 11px",
                                    color: "#fff",
                                  }}
                                >
                                  <h5
                                    className="m-0 fw-bolder fs-20"
                                    style={{ color: "#fff" }}
                                  >
                                    Bill Summary
                                  </h5>
                                  <h5
                                    className="m-0 fw-bolder fs-20"
                                    style={{ color: "#fff" }}
                                  >
                                    {/* {selectedInvoice.bill_period ||
                                                                        (selectedInvoice.inv_from_date
                                                                            ? `${formatDateTime(
                                                                                selectedInvoice.inv_from_date,
                                                                                "dd-mm-yyyy"
                                                                            )} - ${formatDateTime(
                                                                                selectedInvoice.inv_to_date,
                                                                                "dd-mm-yyyy"
                                                                            )}`
                                                                            : "N/A")} */}
                                    <th scope="row" className="fw-bold">
                                      Total Amount
                                    </th>
                                  </h5>
                                </div>
                                {selectedInvoice.inv_subject &&
                                  selectedInvoice.inv_subject
                                    .toLowerCase()
                                    .includes("recharge") && (
                                    <div className="table-responsive-sm">
                                      <table style={invoiceStyles.table}>
                                        <tbody>
                                          {selectedInvoice.plan_option &&
                                            selectedInvoice.plan_option.length > 0 ? (
                                            selectedInvoice.plan_option.map(
                                              (plan, index) => (
                                                <tr
                                                  key={index}
                                                  style={invoiceStyles.altRow}
                                                >
                                                  <td style={invoiceStyles.textCell}>
                                                    <h6 className="mb-0">
                                                      <span className="fw-bold">
                                                        Recharge
                                                      </span>
                                                    </h6>
                                                    {renderDescription(
                                                      plan.description
                                                    )}
                                                  </td>
                                                  <td style={{ textAlign: "center" }}>
                                                    <b>
                                                      $
                                                      {Number(
                                                        plan.total ||
                                                        selectedInvoice.invoice_amount ||
                                                        0
                                                      ).toFixed(2)}
                                                    </b>
                                                  </td>
                                                </tr>
                                              )
                                            )
                                          ) : (
                                            <tr style={invoiceStyles.altRow}>
                                              <td style={invoiceStyles.textCell}>
                                                <h6 className="mb-0">
                                                  <span className="fw-bold">
                                                    Recharge
                                                  </span>
                                                </h6>
                                                <p className="mb-0">
                                                  {capitalizeWords(selectedInvoice.comments) || "Account Recharge"}

                                                </p>
                                              </td>
                                              <td style={{ textAlign: "center" }}>
                                                <b>
                                                  $
                                                  {Number(
                                                    selectedInvoice.invoice_amount ||
                                                    0
                                                  ).toFixed(2)}
                                                </b>
                                              </td>
                                            </tr>
                                          )}
                                          {/* <tr>
                                          <td style={invoiceStyles.noWrap}>
                                            <h6 className="mb-0">
                                              Additional Charges
                                            </h6>
                                          </td>
                                          <td style={{ textAlign: "center" }}>
                                            0.00
                                          </td>
                                        </tr> */}
                                          <tr style={invoiceStyles.altRow}>
                                            <td style={invoiceStyles.noWrap}>
                                              <h6 className="mb-0 text-end fw-bold">
                                                Total
                                              </h6>
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                              <b>
                                                $
                                                {Number(
                                                  selectedInvoice.invoice_amount ||
                                                  0
                                                ).toFixed(2)}
                                              </b>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td style={invoiceStyles.noWrap}>
                                              <h6 className="mb-0 text-end">
                                                Taxes and US Fee
                                              </h6>
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                              0.00
                                            </td>
                                          </tr>
                                          <tr style={invoiceStyles.altRow}>
                                            <td style={invoiceStyles.noWrap}>
                                              <h6 className="mb-0 text-end fw-bold">
                                                Total Paid
                                              </h6>
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                              <b>
                                                $
                                                {Number(
                                                  selectedInvoice.invoice_amount ||
                                                  0
                                                ).toFixed(2)}
                                              </b>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                {selectedInvoice.plan_option &&
                                  (Array.isArray(selectedInvoice.plan_option)
                                    ? String(
                                      selectedInvoice.plan_option[0]
                                        ?.description || ""
                                    ).toLowerCase().includes("sms")
                                    : String(
                                      selectedInvoice.plan_option
                                        ?.description || ""
                                    ).toLowerCase().includes("sms")) && (
                                    <div className="table-responsive-sm">
                                      <table style={invoiceStyles.table}>
                                        <tbody>
                                          <tr style={invoiceStyles.altRow}>
                                            <td style={invoiceStyles.textCell}>
                                              <h6 className="mb-0">
                                                <span className="fw-bold">
                                                  {selectedInvoice.inv_subject ||
                                                    "SMS Plan"}
                                                </span>
                                              </h6>
                                              {selectedInvoice.plan_option &&
                                                selectedInvoice.plan_option
                                                  .length > 0
                                                ? renderDescription(
                                                  selectedInvoice.plan_option[0]
                                                    .description
                                                )
                                                : "N/A"}
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                              <b>
                                                $
                                                {Number(
                                                  selectedInvoice.unit_price || 0
                                                ).toFixed(2)}
                                              </b>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td style={invoiceStyles.noWrap}>
                                              <h6 className="mb-0 text-end">
                                                Taxes and US Fee (
                                                {selectedInvoice.plan_tax || 0}%)
                                              </h6>
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                              {selectedInvoice.tax_amount &&
                                                Number(selectedInvoice.tax_amount) >
                                                0
                                                ? `$${Number(
                                                  selectedInvoice.tax_amount
                                                ).toFixed(2)}`
                                                : "N/A"}
                                            </td>
                                          </tr>
                                          <tr style={invoiceStyles.altRow}>
                                            <td style={invoiceStyles.noWrap}>
                                              <h6 className="mb-0 text-end fw-bold">
                                                Total (Before Additional)
                                              </h6>
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                              <b>
                                                $
                                                {(
                                                  Number(
                                                    selectedInvoice.unit_price || 0
                                                  ) +
                                                  Number(
                                                    selectedInvoice.tax_amount || 0
                                                  )
                                                ).toFixed(2)}
                                              </b>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td style={invoiceStyles.noWrap}>
                                              <h6 className="mb-0 text-end fw-500">
                                                Campaign Registry Brand
                                                Registration/Resubmission
                                              </h6>
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                              N/A
                                            </td>
                                          </tr>
                                          <tr style={invoiceStyles.altRow}>
                                            <td style={invoiceStyles.noWrap}>
                                              <h6 className="mb-0 text-end fw-bold">
                                                Use Case (MRC)
                                              </h6>
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                              <b>0.00</b>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td style={invoiceStyles.noWrap}>
                                              <h6 className="mb-0 text-end fw-bold">
                                                Vetting Charges
                                              </h6>
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                              <b>0.00</b>
                                            </td>
                                          </tr>
                                          <tr style={invoiceStyles.altRow}>
                                            <td style={invoiceStyles.noWrap}>
                                              <h6 className="mb-0 text-end fw-bold">
                                                DID Charges{" "}
                                                {selectedInvoice.no_of_dids > 0 &&
                                                  selectedInvoice.dids_cost > 0
                                                  ? `${selectedInvoice.no_of_dids} * $${(
                                                    Number(
                                                      selectedInvoice.dids_cost
                                                    ) /
                                                    selectedInvoice.no_of_dids
                                                  ).toFixed(2)}`
                                                  : ""}
                                              </h6>
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                              <b>
                                                {Number(selectedInvoice.dids_cost) >
                                                  0
                                                  ? `$${Number(
                                                    selectedInvoice.dids_cost
                                                  ).toFixed(2)}`
                                                  : "0.00"}
                                              </b>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td style={invoiceStyles.noWrap}>
                                              <h6 className="mb-0 text-end fw-bold">
                                                Total Paid
                                              </h6>
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                              <b>
                                                $
                                                {(
                                                  Number(
                                                    selectedInvoice.unit_price || 0
                                                  ) +
                                                  Number(
                                                    selectedInvoice.tax_amount || 0
                                                  ) +
                                                  Number(
                                                    selectedInvoice.dids_cost || 0
                                                  )
                                                ).toFixed(2)}
                                              </b>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                {selectedInvoice.plan_option &&
                                  (Array.isArray(selectedInvoice.plan_option)
                                    ? String(
                                      selectedInvoice.plan_option[0]
                                        ?.description || ""
                                    ).toLowerCase().includes("whatsapp")
                                    : String(
                                      selectedInvoice.plan_option
                                        ?.description || ""
                                    ).toLowerCase().includes("whatsapp")) && (
                                    <div className="table-responsive-sm">
                                      <table style={invoiceStyles.table}>
                                        <tbody>
                                          <tr style={invoiceStyles.altRow}>
                                            <td style={invoiceStyles.textCell}>
                                              <h6 className="mb-0">
                                                <span className="fw-bold">
                                                  {selectedInvoice.inv_subject ||
                                                    "WhatsApp Plan"}
                                                </span>
                                              </h6>
                                              <p className="mb-0">
                                                {selectedInvoice.plan_option &&
                                                  selectedInvoice.plan_option
                                                    .length > 0
                                                  ? `${selectedInvoice.plan_option[0].description?.split(
                                                    ","
                                                  )[0] || "WhatsApp Services"}`
                                                  : "N/A"}
                                              </p>
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                              <b>
                                                $
                                                {selectedInvoice.plan_option &&
                                                  selectedInvoice.plan_option
                                                    .length > 0
                                                  ? Number(
                                                    selectedInvoice.plan_option[0]
                                                      .total || 0
                                                  ).toFixed(2)
                                                  : "0.00"}
                                              </b>
                                            </td>
                                          </tr>
                                          {/* <tr>
                                                                                    <td style={invoiceStyles.noWrap}>
                                                                                        <h6 className="mb-0">DID Charges</h6>
                                                                                    </td>
                                                                                    <td style={{ textAlign: "center" }}>
                                                                                        <b>
                                                                                            {Number(
                                                                                                selectedInvoice.dids_cost
                                                                                            ) > 0
                                                                                                ? `$${Number(
                                                                                                    selectedInvoice.dids_cost
                                                                                                ).toFixed(2)}`
                                                                                                : "0.00"}
                                                                                        </b>
                                                                                    </td>
                                                                                </tr> */}
                                          {/* <tr style={invoiceStyles.altRow}>
                                          <td style={invoiceStyles.noWrap}>
                                            <h6 className="mb-0">
                                              Funds Added for Conversation
                                            </h6>
                                          </td>
                                          <td style={{ textAlign: "center" }}>
                                            <b>0.00</b>
                                          </td>
                                        </tr> */}
                                          {/* <tr>
                                                                                    <td style={invoiceStyles.noWrap}>
                                                                                        <h6 className="mb-0 text-end fw-500">
                                                                                            Subtotal
                                                                                        </h6>
                                                                                    </td>
                                                                                    <td style={{ textAlign: "center" }}>
                                                                                        <b>
                                                                                            $
                                                                                            {(
                                                                                                (selectedInvoice.plan_option &&
                                                                                                    selectedInvoice.plan_option
                                                                                                        .length > 0
                                                                                                    ? Number(
                                                                                                        selectedInvoice
                                                                                                            .plan_option[0].total || 0
                                                                                                    )
                                                                                                    : 0) +
                                                                                                Number(
                                                                                                    selectedInvoice.dids_cost || 0
                                                                                                )
                                                                                            ).toFixed(2)}
                                                                                        </b>
                                                                                    </td>
                                                                                </tr> */}
                                          <tr style={invoiceStyles.altRow}>
                                            <td style={invoiceStyles.noWrap}>
                                              <h6 className="mb-0 text-end fw-500">
                                                Taxes and US Fee (
                                                {selectedInvoice.plan_tax || 0}%)
                                              </h6>
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                              <b>
                                                {selectedInvoice.plan_tax &&
                                                  Number(selectedInvoice.plan_tax) >
                                                  0
                                                  ? `$${(
                                                    (Number(
                                                      selectedInvoice.invoice_amount ||
                                                      0
                                                    ) *
                                                      Number(
                                                        selectedInvoice.plan_tax
                                                      )) /
                                                    100
                                                  ).toFixed(2)}`
                                                  : "0.00"}
                                              </b>
                                            </td>
                                          </tr>
                                          <tr style={invoiceStyles.altRow}>
                                            <td style={invoiceStyles.noWrap}>
                                              <h6 className="mb-0 text-end fw-bold">
                                                Total Paid
                                              </h6>
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                              <b>
                                                $
                                                {Number(
                                                  invoiceTotalCost ||
                                                  selectedInvoice.invoice_amount ||
                                                  0
                                                ).toFixed(2)}
                                              </b>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                {!selectedInvoice.plan_option ||
                                  (Array.isArray(selectedInvoice.plan_option)
                                    ? !String(
                                      selectedInvoice.plan_option[0]
                                        ?.description || ""
                                    ).toLowerCase().includes("whatsapp") &&
                                    !String(
                                      selectedInvoice.plan_option[0]
                                        ?.description || ""
                                    ).toLowerCase().includes("sms")
                                    : !String(
                                      selectedInvoice.plan_option
                                        ?.description || ""
                                    ).toLowerCase().includes("whatsapp") &&
                                    !String(
                                      selectedInvoice.plan_option
                                        ?.description || ""
                                    ).toLowerCase().includes("sms")) && (
                                    <div className="table-responsive-sm">
                                      <table style={invoiceStyles.table}>
                                        <tbody>
                                          <tr style={invoiceStyles.altRow}>
                                            <td style={invoiceStyles.textCell}>
                                              <h6 className="mb-0">
                                                <span className="fw-bold">
                                                  {capitalizeWords(selectedInvoice.inv_subject) || "Basic Plan"}

                                                </span>
                                              </h6>
                                              {selectedInvoice.plan_option &&
                                                selectedInvoice.plan_option
                                                  .length > 0 ? (
                                                renderDescription(
                                                  selectedInvoice.plan_option[0]
                                                    .description
                                                )
                                              ) : (
                                                <p className="mb-0">
                                                  {selectedInvoice.plan_purchased ||
                                                    "N/A"}
                                                </p>
                                              )}
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                              <b>
                                                ${Number(totalPlansCost).toFixed(2)}
                                              </b>
                                            </td>
                                          </tr>
                                          {/* <tr>
                                                                                    <td style={invoiceStyles.noWrap}>
                                                                                        <h6 className="mb-0">
                                                                                            Additional Charges
                                                                                        </h6>
                                                                                    </td>
                                                                                    <td style={{ textAlign: "center" }}>
                                                                                        0.00
                                                                                    </td>
                                                                                </tr> */}
                                          {/* <tr style={invoiceStyles.altRow}>
                                                                                    <td style={invoiceStyles.noWrap}>
                                                                                        <h6 className="mb-0 text-end fw-bold">
                                                                                            Subtotal
                                                                                        </h6>
                                                                                    </td>
                                                                                    <td style={{ textAlign: "center" }}>
                                                                                        <b>
                                                                                            ${Number(totalPlansCost).toFixed(2)}
                                                                                        </b>
                                                                                    </td>
                                                                                </tr> */}
                                          <tr>
                                            <td style={invoiceStyles.noWrap}>
                                              <h6 className="mb-0 text-end fw-500">
                                                Taxes and US Fee (
                                                {selectedInvoice.plan_tax || 0}%)
                                              </h6>
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                              {invoiceTotalCost - totalPlansCost >
                                                0 ? (
                                                <b>
                                                  $
                                                  {(
                                                    invoiceTotalCost -
                                                    totalPlansCost
                                                  ).toFixed(2)}
                                                </b>
                                              ) : (
                                                "0.00"
                                              )}
                                            </td>
                                          </tr>
                                          <tr style={invoiceStyles.altRow}>
                                            <td style={invoiceStyles.noWrap}>
                                              <h6 className="mb-0 text-end fw-bold">
                                                Total Paid
                                              </h6>
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                              <b>
                                                $
                                                {Number(invoiceTotalCost).toFixed(
                                                  2
                                                )}
                                              </b>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                              </div>
                              <div className="col-sm-12 mt-5">
                                <p
                                  className="mb-0"
                                  style={invoiceStyles.textCell}
                                >
                                  {selectedInvoice.notes ||
                                    "Should you have any questions or concerns regarding the invoice and billing, please don't hesitate to reach out to our dedicated support team (Email: support@vitelglobal.com, Phone: 732-444-3132)."}
                                </p>
                                <p style={invoiceStyles.textCell}>
                                  <b>
                                    Thank you for choosing Vitel Global
                                    Communications. We look forward to continuing
                                    this journey together towards excellence.
                                  </b>
                                </p>
                                <p className="mb-0" style={invoiceStyles.noWrap}>
                                  Best Regards,
                                </p>
                                <p
                                  style={{
                                    color: "#ed7d31",
                                    webkitPrintColorAdjust: "exact",
                                  }}
                                >
                                  <b>Vitel Global Communications LLC</b>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}