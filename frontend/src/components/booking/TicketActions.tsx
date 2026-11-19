import { useState } from 'react';
import { apiClient } from '../../api/apiClient';

interface TicketDocument {
  type: string; pnr: string; totalPrice: number; passengers: string[];
  legs: { flightNumber: string; origin: string; destination: string; departureTime: string;
    arrivalTime: string; fareClass: string; seat: string | null; gate: string | null;
    boardingTime: string | null; qrPayload: string | null }[];
}

export function TicketActions({ bookingId, status }: { bookingId: number; status: string }) {
  const [document, setDocument] = useState<TicketDocument | null>(null);
  const [qr, setQr] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (status !== 'CONFIRMED') return null;
  async function load(boarding: boolean) {
    setBusy(true); setError('');
    try {
      const ticket = await apiClient.get<TicketDocument>(`/bookings/${bookingId}/${boarding ? 'boarding-pass' : 'ticket'}`);
      if (boarding) {
        const QRCode = await import('qrcode');
        setQr(await Promise.all(ticket.legs.map(leg => QRCode.toDataURL(leg.qrPayload!))));
        setDocument(ticket);
      } else {
        const { jsPDF } = await import('jspdf');
        const pdf = new jsPDF();
        // Embed the browser-rendered text as an image so Vietnamese names retain their glyphs.
        const canvas = window.document.createElement('canvas');
        canvas.width = 1400; canvas.height = 1800;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Không thể tạo PDF');
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#111'; ctx.font = '28px sans-serif';
        const lines = ['SKYWING — VÉ ĐIỆN TỬ', `PNR: ${ticket.pnr}`, ...ticket.passengers,
          ...ticket.legs.flatMap(l => [l.flightNumber, `${l.origin} → ${l.destination}`,
            `Khởi hành: ${l.departureTime}`, `Đến: ${l.arrivalTime}`, `Hạng vé: ${l.fareClass}`]),
          `Tổng tiền: ${Number(ticket.totalPrice).toLocaleString('vi-VN')} VND`];
        for (let start = 0; start < lines.length; start += 28) {
          if (start > 0) pdf.addPage();
          ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#111';
          lines.slice(start, start + 28).forEach((line, i) => ctx.fillText(line, 50, 70 + i * 55, 1300));
          pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 5, 5, 200, 257);
        }
        pdf.save(`ticket-${ticket.pnr}.pdf`);
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Không thể tải vé'); }
    finally { setBusy(false); }
  }
  return <div className="p-4 space-y-3">
    <div className="flex flex-wrap gap-3">
      <button disabled={busy} onClick={() => void load(false)} className="border rounded px-4 py-2">Tải Vé Điện Tử PDF</button>
      <button disabled={busy} onClick={() => void load(true)} className="border rounded px-4 py-2">Xem Thẻ Lên Máy Bay</button>
    </div>
    {error && <p role="alert">{error}</p>}
    {document && <section aria-label="Thẻ lên máy bay" className="border rounded p-4">
      <button onClick={() => setDocument(null)} className="float-right">Đóng</button>
      <h3 className="font-bold">Thẻ lên máy bay — Bản xem trước</h3>
      <p>PNR: {document.pnr} · {document.passengers.join(', ')}</p>
      <p>Chưa hoàn tất check-in. Ghế và cổng bay chưa phân bổ. Giờ lên tàu là dự kiến.</p>
      {document.legs.map((leg, i) => <div key={i}>
        <p>{leg.flightNumber}: {leg.origin} → {leg.destination}</p>
        <p>Ghế: {leg.seat ?? 'Chưa phân bổ'} · Cổng: {leg.gate ?? 'Chưa phân bổ'} · Lên tàu: {leg.boardingTime}</p>
        <img src={qr[i]} width={160} height={160} alt={`QR bản xem trước ${leg.flightNumber}`} />
      </div>)}
    </section>}
  </div>;
}
