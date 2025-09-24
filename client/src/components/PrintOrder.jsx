import React from 'react';
import { formatVnd, getOrderStatusText } from '../utils/helpers';

const PrintOrder = ({ order, skuToStockLeft = {} }) => {
  const items = Array.isArray(order?.items) ? order.items : [];
  const shipping = order?.shippingAddress || {};

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{`Đơn hàng #${String(order?._id || '').slice(-6)}`}</title>
        <style
          dangerouslySetInnerHTML={{
            __html: `
          * { box-sizing: border-box; }
          body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"; margin: 0; padding: 24px; color: #111827; }
          .container { max-width: 1000px; margin: 0 auto; }
          .section { margin-bottom: 16px; }
          h1 { font-size: 20px; margin: 0 0 8px; }
          h2 { font-size: 16px; margin: 0 0 8px; color: #374151; }
          table { width: 100%; border-collapse: collapse; }
          .muted { color: #6b7280; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
            .pagebreak { page-break-inside: avoid; }
          }
        `,
          }}
        />
      </head>
      <body>
        <div className="container">
          <div className="section">
            <h1>{`Chi tiết đơn hàng #${String(order?._id || '').slice(-6)}`}</h1>
            <div className="muted">{`Ngày đặt: ${new Date(order?.createdAt).toLocaleDateString('vi-VN')}`}</div>
            <div className="muted">
              {`Trạng thái: `}
              <strong>{getOrderStatusText(order?.status) || order?.status}</strong>
            </div>
            <div className="muted">
              {`Thanh toán: `}
              <strong>{String(order?.paymentMethod || '').toUpperCase()}</strong>
            </div>
          </div>

          <div className="section grid pagebreak">
            <div>
              <h2>Khách hàng</h2>
              <div>{shipping.fullName || 'N/A'}</div>
              <div>{shipping.phone || 'N/A'}</div>
            </div>
            <div>
              <h2>Giao hàng</h2>
              <div>{shipping.street || ''}</div>
              <div>{shipping.city || ''}</div>
              <div>{shipping.postalCode || ''}</div>
              <div>{shipping.country || ''}</div>
            </div>
          </div>

          <div className="section pagebreak">
            <h2>Sản phẩm</h2>
            <table>
              <thead>
                <tr>
                  <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'left' }}>#</th>
                  <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'left' }}>Sản phẩm</th>
                  <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'left' }}>SKU</th>
                  <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'left' }}>Màu</th>
                  <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'left' }}>Size</th>
                  <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'center' }}>SL</th>
                  <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>Giá</th>
                  <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>Thành tiền</th>
                  <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>Tồn còn</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => {
                  const key = `${it.sku}-${it.color || ''}-${it.size || ''}`;
                  const left = skuToStockLeft[key];
                  return (
                    <tr key={it._id || `${it.sku}-${idx}`}>
                      <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{idx + 1}</td>
                      <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{it.name || ''}</td>
                      <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{it.sku || ''}</td>
                      <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{it.color || ''}</td>
                      <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{it.size || ''}</td>
                      <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'center' }}>
                        {it.quantity || 0}
                      </td>
                      <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>
                        {formatVnd(it.price || 0)}
                      </td>
                      <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>
                        {formatVnd((it.price || 0) * (it.quantity || 0))}
                      </td>
                      <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>
                        {left == null ? '' : `Còn: ${left}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="section" style={{ textAlign: 'right' }}>
            <div className="muted">
              {`Tạm tính: `}
              <strong>{formatVnd(order?.subtotal || 0)}</strong>
            </div>
            <div className="muted">
              {`Thuế: `}
              <strong>{formatVnd(order?.tax || 0)}</strong>
            </div>
            <div className="muted">
              {`Phí vận chuyển: `}
              <strong>{formatVnd(order?.shipping || 0)}</strong>
            </div>
            <h2>{`Tổng cộng: ${formatVnd(order?.total || 0)}`}</h2>
          </div>

          <div className="no-print" style={{ marginTop: 16, textAlign: 'right' }}>
            <button
              id="printBtn"
              onClick={() => window.print()}
              style={{
                padding: '8px 12px',
                background: '#ec4899',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              In
            </button>
          </div>
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                function onReady(fn){
                  if(document.readyState === 'complete' || document.readyState === 'interactive'){ fn(); }
                  else { document.addEventListener('DOMContentLoaded', fn); }
                }
                onReady(function(){
                  var btn = document.getElementById('printBtn');
                  if (btn && !btn.__bound) {
                    btn.addEventListener('click', function(){ try { window.print(); } catch(e){} });
                    btn.__bound = true;
                  }
                  setTimeout(function(){ try { window.print(); } catch(e){} }, 300);
                });
                window.addEventListener('afterprint', function(){ try { window.close(); } catch(e){} });
              })();
            `,
          }}
        />
      </body>
    </html>
  );
};

export default PrintOrder;
