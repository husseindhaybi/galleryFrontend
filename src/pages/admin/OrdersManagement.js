import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useEffect, useState } from 'react';
import { FaDownload, FaEye, FaPrint, FaSearch } from 'react-icons/fa';
import Swal from 'sweetalert2';
import AdminLayout from '../../components/AdminLayout';


const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, statusFilter, orders]);

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(o =>
        o.order_id.toString().includes(searchTerm) ||
        (o.username && o.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (o.email && o.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(o => o.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    let confirmMessage = `Change order #${orderId} status to "${newStatus}"?`;
    
    if (newStatus === 'delivered') {
      confirmMessage = `Mark order #${orderId} as DELIVERED?\n\n⚠️ This will:\n✓ Mark payment as PAID\n✓ Send confirmation email\n\nConfirm?`;
    } else if (newStatus === 'cancelled') {
      confirmMessage = `Cancel order #${orderId}?\n\n⚠️ This will:\n✓ Restore stock\n✓ Send cancellation email\n\nConfirm?`;
    }
    
    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
  icon: 'success',
  title: 'Order Updated',
  text: `Order status updated to ${newStatus}!`,
  confirmButtonText: 'OK'
});

      setTimeout(() => loadOrders(), 500);
    } catch (error) {
      Swal.fire({
  icon: 'error',
  title: 'Update Failed',
  text: error.response?.data?.error || 'Failed to update status',
  confirmButtonText: 'OK'
});

    }
  };

  //  Print Invoice (Desktop only)
  const handlePrintInvoice = (order) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    const invoiceHTML = generateInvoiceHTML(order);
    
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  //  Download Real PDF (Works on Mobile & Desktop)
  const handleDownloadPDF = async (order) => {
    setDownloading(true);
    
    try {
   
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.width = '800px';
      container.innerHTML = generateInvoiceHTML(order);
      document.body.appendChild(container);
      

      await new Promise(resolve => setTimeout(resolve, 100));
      
     
      const invoiceElement = container.querySelector('.invoice-container');
      
      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
     
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      
      pdf.save(`Invoice-${order.order_id}-GalleryDhaybi.pdf`);
      
    
      document.body.removeChild(container);
    
      Swal.fire({
  icon: 'success',
  title: 'Invoice Ready!',
  text: 'Invoice downloaded successfully!',
  confirmButtonText: 'OK'
});

      
    } catch (error) {
      console.error('PDF generation error:', error);
      Swal.fire({
  icon: 'error',
  title: 'PDF Error',
  text: 'Failed to generate PDF. Please try again.',
  confirmButtonText: 'OK'
});

    } finally {
      setDownloading(false);
    }
  };

  //  Generate Invoice HTML
  const generateInvoiceHTML = (order) => {
    const paymentStatus = order.payment_status === 'paid' || order.payment_status === 'completed' ? 'Paid' : 'Pending';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            background: #fff;
            color: #333;
          }
          .invoice-container { 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 40px;
            background: white;
          }
          .invoice-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 3px solid #0d6efd;
          }
          .company-info h1 { 
            color: #0d6efd; 
            font-size: 28px; 
            margin-bottom: 8px;
          }
          .company-info p { 
            color: #666; 
            font-size: 13px; 
            margin: 2px 0;
          }
          .invoice-meta { 
            text-align: right; 
          }
          .invoice-meta h2 { 
            color: #0d6efd; 
            font-size: 24px; 
            margin-bottom: 8px;
          }
          .invoice-meta p { 
            margin: 4px 0; 
            font-size: 13px;
          }
          .details-section { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
            margin-bottom: 25px;
          }
          .detail-box { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 6px;
          }
          .detail-box h3 { 
            color: #0d6efd; 
            font-size: 14px; 
            margin-bottom: 10px;
            padding-bottom: 6px;
            border-bottom: 2px solid #0d6efd;
          }
          .detail-box p { 
            margin: 6px 0; 
            font-size: 13px;
            line-height: 1.5;
          }
          .detail-box strong { 
            color: #555; 
            display: inline-block;
            width: 80px;
          }
          .items-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0;
          }
          .items-table thead { 
            background: #0d6efd; 
            color: white;
          }
          .items-table th { 
            padding: 10px; 
            text-align: left; 
            font-weight: 600;
            font-size: 13px;
          }
          .items-table td { 
            padding: 10px; 
            border-bottom: 1px solid #ddd;
            font-size: 13px;
          }
          .items-table tbody tr:nth-child(even) { 
            background: #f8f9fa; 
          }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .total-section { 
            margin-top: 25px; 
            text-align: right;
          }
          .total-row { 
            display: flex; 
            justify-content: flex-end; 
            padding: 8px 0;
            font-size: 14px;
          }
          .total-row.grand-total { 
            font-size: 20px; 
            font-weight: bold; 
            color: #0d6efd;
            border-top: 3px solid #0d6efd;
            padding-top: 12px;
            margin-top: 8px;
          }
          .total-label { 
            width: 150px; 
            font-weight: 600;
          }
          .total-value { 
            width: 120px; 
            text-align: right;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
          }
          .status-delivered { background: #198754; color: white; }
          .status-pending { background: #ffc107; color: #000; }
          .status-processing { background: #0dcaf0; color: #000; }
          .status-shipped { background: #0d6efd; color: white; }
          .status-cancelled { background: #dc3545; color: white; }
          .payment-paid { background: #198754; color: white; }
          .payment-pending { background: #ffc107; color: #000; }
          .footer { 
            margin-top: 35px; 
            padding-top: 15px; 
            border-top: 2px solid #ddd; 
            text-align: center; 
            color: #666;
            font-size: 11px;
          }
          .footer p { margin: 4px 0; }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="invoice-header">
            <div class="company-info">
              <h1> Gallery Dhaybi</h1>
              <p>Premium Furniture Store</p>
              <p>Email: husseindhaybi8@gmail.com</p>
              <p>Phone: +961 03509827</p>
              <p>Beirut, Lebanon</p>
            </div>
            <div class="invoice-meta">
              <h2>INVOICE</h2>
              <p><strong>Invoice #:</strong> ${order.order_id}</p>
              <p><strong>Date:</strong> ${new Date(order.order_date).toLocaleDateString()}</p>
              <p><span class="status-badge status-${order.status}">${order.status}</span></p>
            </div>
          </div>

          <div class="details-section">
            <div class="detail-box">
              <h3>👤 Customer</h3>
              <p><strong>Name:</strong> ${order.full_name || order.username || 'Guest'}</p>
              <p><strong>Email:</strong> ${order.email}</p>
              ${order.phone ? `<p><strong>Phone:</strong> ${order.phone}</p>` : ''}
            </div>
            <div class="detail-box">
              <h3>🚚 Shipping</h3>
              <p style="white-space: pre-line;">${order.shipping_address || 'N/A'}</p>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th class="text-center">Qty</th>
                <th class="text-right">Price</th>
                <th class="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${order.items ? order.items.map(item => `
                <tr>
                  <td>${item.product_name}</td>
                  <td class="text-center">${item.quantity}</td>
                  <td class="text-right">$${Number(item.price_at_purchase).toFixed(2)}</td>
                  <td class="text-right">$${Number(item.subtotal).toFixed(2)}</td>
                </tr>
              `).join('') : ''}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-row">
              <div class="total-label">Subtotal:</div>
              <div class="total-value">$${Number(order.total_amount).toFixed(2)}</div>
            </div>
            <div class="total-row">
              <div class="total-label">Shipping:</div>
              <div class="total-value">$0.00</div>
            </div>
            <div class="total-row grand-total">
              <div class="total-label">TOTAL:</div>
              <div class="total-value">$${Number(order.total_amount).toFixed(2)}</div>
            </div>
            <div class="total-row" style="margin-top: 15px;">
              <div class="total-label">Payment:</div>
              <div class="total-value">Cash on Delivery</div>
            </div>
            <div class="total-row">
              <div class="total-label">Status:</div>
              <div class="total-value">
                <span class="status-badge payment-${paymentStatus.toLowerCase()}">${paymentStatus}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p><strong>Thank you for your business!</strong></p>
            <p>Questions? Contact us at husseindhaybi8@gmail.com</p>
            <p>This is a computer-generated invoice.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'pending': 'bg-warning text-dark',
      'processing': 'bg-info text-white',
      'shipped': 'bg-primary text-white',
      'delivered': 'bg-success text-white',
      'cancelled': 'bg-danger text-white'
    };
    return statusMap[status?.toLowerCase()] || 'bg-secondary text-white';
  };

  const getPaymentBadge = (paymentStatus) => {
    if (paymentStatus === 'paid' || paymentStatus === 'completed') {
      return <span className="badge bg-success">✅ Paid</span>;
    }
    return <span className="badge bg-warning text-dark">⏳ Pending</span>;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Loading orders...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-1">Orders Management</h1>
        <p className="text-muted mb-0">Manage and track all customer orders</p>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-6 col-lg-5">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <FaSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by order ID, customer name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-3 col-lg-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="col-12 col-sm-6 col-md-3 col-lg-4 text-sm-end">
              <span className="badge bg-primary fs-6 px-3 py-2">
                {filteredOrders.length} orders
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-5">
              <h3 className="h5 text-muted mb-2">No orders found</h3>
              <p className="text-muted small mb-0">Orders will appear here when customers place them</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="px-4 py-3 fw-semibold text-nowrap">Order ID</th>
                    <th className="py-3 fw-semibold text-nowrap">Customer</th>
                    <th className="py-3 fw-semibold text-nowrap d-none d-lg-table-cell">Date</th>
                    <th className="py-3 fw-semibold text-nowrap">Total</th>
                    <th className="py-3 fw-semibold text-nowrap d-none d-md-table-cell">Payment</th>
                    <th className="py-3 fw-semibold text-nowrap">Status</th>
                    <th className="py-3 fw-semibold text-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.order_id}>
                      <td className="px-4 py-3 fw-bold text-primary text-nowrap">
                        #{order.order_id}
                      </td>
                      <td className="py-3">
                        <div>
                          <div className="fw-semibold text-truncate" style={{ maxWidth: '200px' }}>
                            {order.username || order.full_name || 'Guest'}
                          </div>
                          <small className="text-muted text-truncate d-block" style={{ maxWidth: '200px' }}>
                            {order.email}
                          </small>
                        </div>
                      </td>
                      <td className="py-3 text-muted text-nowrap d-none d-lg-table-cell">
                        {new Date(order.order_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 fw-bold text-success text-nowrap">
                        ${Number(order.total_amount).toFixed(2)}
                      </td>
                      <td className="py-3 d-none d-md-table-cell">
                        {getPaymentBadge(order.payment_status)}
                      </td>
                      <td className="py-3">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                          className={`form-select form-select-sm badge ${getStatusBadgeClass(order.status)} border-0`}
                          style={{ 
                            width: 'auto', 
                            minWidth: '120px',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3">
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowModal(true);
                            }}
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-success d-none d-lg-inline-flex"
                            onClick={() => handlePrintInvoice(order)}
                            title="Print Invoice (Desktop)"
                          >
                            <FaPrint />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-info"
                            onClick={() => handleDownloadPDF(order)}
                            title="Download PDF"
                            disabled={downloading}
                          >
                            {downloading ? (
                              <span className="spinner-border spinner-border-sm" />
                            ) : (
                              <FaDownload />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && selectedOrder && (
        <>
          <div 
            className="modal-backdrop fade show"
            onClick={() => setShowModal(false)}
          />
          
          <div 
            className="modal fade show d-block" 
            tabIndex="-1"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <div className="modal-dialog modal-dialog-scrollable modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title fw-bold">
                    Order Details #{selectedOrder.order_id}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={() => setShowModal(false)}
                  />
                </div>
                
                <div className="modal-body p-4">
                  <div className="mb-4">
                    <h6 className="fw-bold text-primary mb-3 pb-2 border-bottom">
                      👤 Customer Information
                    </h6>
                    <div className="row g-2">
                      <div className="col-12">
                        <p className="mb-2">
                          <strong className="text-muted small d-block">Name:</strong>
                          <span>{selectedOrder.full_name || selectedOrder.username || 'Guest'}</span>
                        </p>
                      </div>
                      <div className="col-12">
                        <p className="mb-2">
                          <strong className="text-muted small d-block">Email:</strong>
                          <span>{selectedOrder.email}</span>
                        </p>
                      </div>
                      {selectedOrder.phone && (
                        <div className="col-12">
                          <p className="mb-0">
                            <strong className="text-muted small d-block">Phone:</strong>
                            <span>{selectedOrder.phone}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h6 className="fw-bold text-primary mb-3 pb-2 border-bottom">
                      📦 Order Information
                    </h6>
                    <div className="row g-2">
                      <div className="col-12 col-md-6">
                        <p className="mb-2">
                          <strong className="text-muted small d-block">Date:</strong>
                          <span>{new Date(selectedOrder.order_date).toLocaleString()}</span>
                        </p>
                      </div>
                      <div className="col-12 col-md-6">
                        <p className="mb-2">
                          <strong className="text-muted small d-block">Status:</strong>
                          <span className={`badge ${getStatusBadgeClass(selectedOrder.status)}`}>
                            {selectedOrder.status}
                          </span>
                        </p>
                      </div>
                      <div className="col-12 col-md-6">
                        <p className="mb-2">
                          <strong className="text-muted small d-block">Payment:</strong>
                          {getPaymentBadge(selectedOrder.payment_status)}
                          <small className="text-muted ms-2">(COD)</small>
                        </p>
                      </div>
                      <div className="col-12 col-md-6">
                        <p className="mb-0">
                          <strong className="text-muted small d-block">Total:</strong>
                          <span className="fw-bold text-success fs-5">
                            ${Number(selectedOrder.total_amount).toFixed(2)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h6 className="fw-bold text-primary mb-3 pb-2 border-bottom">
                      🚚 Shipping Address
                    </h6>
                    <div className="card bg-light border-0">
                      <div className="card-body">
                        <p className="mb-0" style={{ whiteSpace: 'pre-line' }}>
                          {selectedOrder.shipping_address || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.items && selectedOrder.items.length > 0 && (
                    <div>
                      <h6 className="fw-bold text-primary mb-3 pb-2 border-bottom">
                        🛍️ Order Items
                      </h6>
                      <div className="table-responsive">
                        <table className="table table-bordered table-sm align-middle">
                          <thead className="table-light">
                            <tr>
                              <th className="fw-semibold">Product</th>
                              <th className="fw-semibold text-center">Qty</th>
                              <th className="fw-semibold text-end">Price</th>
                              <th className="fw-semibold text-end">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedOrder.items.map((item, index) => (
                              <tr key={index}>
                                <td>{item.product_name}</td>
                                <td className="text-center">
                                  <span className="badge bg-secondary">{item.quantity}</span>
                                </td>
                                <td className="text-end">${Number(item.price_at_purchase).toFixed(2)}</td>
                                <td className="text-end fw-bold">
                                  ${Number(item.subtotal).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="table-light">
                            <tr>
                              <td colSpan="3" className="text-end fw-bold">Total:</td>
                              <td className="text-end fw-bold text-success fs-5">
                                ${Number(selectedOrder.total_amount).toFixed(2)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-success d-none d-lg-flex align-items-center gap-2"
                    onClick={() => handlePrintInvoice(selectedOrder)}
                  >
                    <FaPrint />
                    <span>Print</span>
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-info d-flex align-items-center gap-2"
                    onClick={() => handleDownloadPDF(selectedOrder)}
                    disabled={downloading}
                  >
                    {downloading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <FaDownload />
                        <span>Download PDF</span>
                      </>
                    )}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default OrdersManagement;