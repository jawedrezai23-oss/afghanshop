import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ProfileScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // User Info aus dem LocalStorage
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        const { data } = await axios.get('/api/orders/mine', config);
        setOrders(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [userInfo]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Linke Spalte: User Infos */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="text-xl font-black mb-6 uppercase tracking-tighter">Mein Konto</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Name</label>
                <p className="font-bold text-slate-800">{userInfo.name}</p>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">E-Mail</label>
                <p className="font-bold text-slate-800">{userInfo.email}</p>
              </div>
              <div className="pt-4">
                 <span className="bg-blue-50 text-blue-600 text-[10px] px-3 py-1 rounded-full font-black uppercase">
                   {userInfo.isAdmin ? 'Admin Konto' : 'Kunden Konto'}
                 </span>
              </div>
            </div>
          </div>
        </div>

        {/* Rechte Spalte: Bestellungen */}
        <div className="md:col-span-3">
          <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter italic">Meine Bestellungen</h2>
          
          {loading ? (
            <p>Lade Bestellungen...</p>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl font-bold">{error}</div>
          ) : orders.length === 0 ? (
            <div className="bg-slate-50 p-8 rounded-3xl text-center border border-dashed border-slate-200">
              <p className="text-slate-500 font-bold">Du hast noch keine Bestellungen getätigt.</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-3xl border border-slate-100 shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">ID</th>
                    <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Datum</th>
                    <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Gesamt</th>
                    <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Bezahlt</th>
                    <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono text-xs text-slate-400">{order._id.substring(0, 10)}...</td>
                      <td className="p-4 font-bold text-slate-700">{order.createdAt.substring(0, 10)}</td>
                      <td className="p-4 font-black text-slate-900">{order.totalPrice.toFixed(2)}€</td>
                      <td className="p-4 text-xs">
                        {order.isPaid ? (
                          <span className="text-green-500 font-bold">Ja ({order.paidAt?.substring(0, 10)})</span>
                        ) : (
                          <span className="text-red-400 font-bold">Nein</span>
                        )}
                      </td>
                      <td className="p-4">
                        {order.isDelivered ? (
                          <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">Geliefert</span>
                        ) : (
                          <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">In Bearbeitung</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}