import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Package, ShoppingBag, Users, Layers, Award, 
  AlertTriangle, FileText, Settings, LogOut, Plus, Search, Edit2, 
  Trash2, UploadCloud, Download, Eye, CheckCircle2, TrendingUp, DollarSign, X, Check 
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { BulkCsvModal } from './BulkCsvModal';

export const AdminDashboard = () => {
  const { 
    products, 
    categories, 
    brands, 
    salesmen, 
    orders, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    addCategory,
    deleteCategory,
    addBrand,
    deleteBrand,
    openInvoiceModal, 
    logout, 
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'products' | 'orders' | 'salesmen' | 'categories' | 'inventory' | 'reports'
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [newCompanyInput, setNewCompanyInput] = useState('');

  const handleAddCategorySubmit = (e) => {
    e.preventDefault();
    if (!newCategoryInput.trim()) return;
    addCategory(newCategoryInput.trim());
    setNewCategoryInput('');
  };

  const handleAddCompanySubmit = (e) => {
    e.preventDefault();
    if (!newCompanyInput.trim()) return;
    addBrand(newCompanyInput.trim());
    setNewCompanyInput('');
  };

  // Form State for New Product
  const [prodForm, setProdForm] = useState({
    name: '',
    brand: 'Bosch',
    category: 'Power Tools',
    sku: '',
    hsn: '84672100',
    price: 5000,
    mrp: 6500,
    stock: 50,
    gstRate: 18,
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
    description: 'High performance industrial grade tool designed for continuous heavy operations.'
  });

  const [prodSearch, setProdSearch] = useState('');

  // Analytics Chart Data
  const revenueLineData = [
    { day: 'Mon', revenue: 1.2 },
    { day: 'Tue', revenue: 2.8 },
    { day: 'Wed', revenue: 4.5 },
    { day: 'Thu', revenue: 3.2 },
    { day: 'Fri', revenue: 6.8 },
    { day: 'Sat', revenue: 5.4 },
    { day: 'Sun', revenue: 8.2 },
  ];

  const categoryPieData = [
    { name: 'Electrical', value: 38 },
    { name: 'Power Tools', value: 24 },
    { name: 'Bearings', value: 18 },
    { name: 'Safety PPE', value: 20 },
  ];
  const COLORS = ['#1e3a8a', '#d97706', '#059669', '#9333ea'];

  const filteredProducts = products.filter(p => {
    if (!prodSearch) return true;
    const q = prodSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
  });

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct({ ...editingProduct, ...prodForm });
      setEditingProduct(null);
    } else {
      addProduct(prodForm);
    }
    setIsAddProductOpen(false);
    setProdForm({
      name: '',
      brand: 'Bosch',
      category: 'Power Tools',
      sku: '',
      hsn: '84672100',
      price: 5000,
      mrp: 6500,
      stock: 50,
      gstRate: 18,
      image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
      description: 'High performance industrial tool.'
    });
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setProdForm({
      name: product.name,
      brand: product.brand,
      category: product.category,
      sku: product.sku,
      hsn: product.hsn || '84672100',
      price: product.price,
      mrp: product.mrp,
      stock: product.stock,
      gstRate: product.gstRate,
      image: product.image,
      description: product.description
    });
    setIsAddProductOpen(true);
  };

  return (
    <div className="py-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Bar */}
        <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest block">
                Anuj Enterprises B2B Enterprise Management
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Managing Director Command Center
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCsvModalOpen(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
            >
              <UploadCloud className="w-4 h-4" /> Bulk CSV Upload
            </button>

            <button
              onClick={logout}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {/* Main Grid: Navigation Sidebar + Content View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm h-fit space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 py-2 block">
              Admin Controls
            </span>

            {[
              { id: 'analytics', label: 'Dashboard & Analytics', icon: LayoutDashboard },
              { id: 'products', label: 'Product Inventory CRUD', icon: Package },
              { id: 'orders', label: 'Orders & GST Invoices', icon: ShoppingBag },
              { id: 'salesmen', label: 'Sales Force Roster', icon: Users },
              { id: 'categories', label: 'Categories & Brands', icon: Layers },
              { id: 'inventory', label: 'Inventory Stock Alerts', icon: AlertTriangle },
              { id: 'reports', label: 'Reports & Tax Export', icon: FileText },
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-3.5 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition-colors ${
                    activeTab === item.id
                      ? 'bg-brand-900 text-white dark:bg-brand-600 shadow-md'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </aside>

          {/* Main View Container */}
          <main className="lg:col-span-9 space-y-8">
            
            {/* Tab 1: Analytics */}
            {activeTab === 'analytics' && (
              <div className="space-y-8">
                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Today's Orders</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">142 Enquiries</span>
                    <span className="text-[11px] font-bold text-emerald-600 block mt-1">+18.5% Growth</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Monthly Orders</span>
                    <span className="text-2xl font-black text-brand-900 dark:text-brand-400">3,480 Orders</span>
                    <span className="text-[11px] text-slate-500 block mt-1">GST Tax Verified</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Active SKUs</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{products.length} Products</span>
                    <span className="text-[11px] text-emerald-600 block mt-1">100% In Stock</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Active Sales Force</span>
                    <span className="text-2xl font-black text-amber-500">{salesmen.length} Partners</span>
                    <span className="text-[11px] text-slate-500 block mt-1">Pan-India Coverage</span>
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Weekly B2B Order Volume Trend (in Units)
                    </h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueLineData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="day" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip />
                          <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Salesmen Region Share
                    </h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {categoryPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Products CRUD */}
            {activeTab === 'products' && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="relative flex-1 max-w-xs">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={prodSearch}
                      onChange={(e) => setProdSearch(e.target.value)}
                      placeholder="Search SKU, Product Name..."
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingProduct(null);
                        setIsAddProductOpen(true);
                      }}
                      className="px-4 py-2 bg-brand-900 hover:bg-brand-800 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Add New Industrial Product
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Product Details</th>
                        <th className="py-3 px-4">Brand</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4 text-right">Price Status</th>
                        <th className="py-3 px-4 text-center">Stock</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredProducts.map(prod => (
                        <tr key={prod.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img src={prod.image} alt={prod.name} className="w-10 h-10 object-contain bg-slate-50 rounded-lg" />
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white block">{prod.name}</span>
                                <span className="text-[10px] text-slate-400">SKU: {prod.sku} | HSN: {prod.hsn}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">{prod.brand}</td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{prod.category}</td>
                          <td className="py-3 px-4 text-right font-extrabold text-brand-900 dark:text-brand-400">Price On Request</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${prod.stock > 10 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                              {prod.stock} units
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center space-x-1">
                            <button onClick={() => handleEditClick(prod)} className="p-1.5 text-slate-400 hover:text-amber-500">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteProduct(prod.id)} className="p-1.5 text-slate-400 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 3: Orders */}
            {activeTab === 'orders' && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Enterprise Orders & Tax Invoices Master Table
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Invoice #</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Salesman</th>
                        <th className="py-3 px-4 text-right">Quote Status</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {orders.map(ord => (
                        <tr key={ord.id} className="hover:bg-slate-50/50">
                          <td className="py-3.5 px-4 font-mono font-bold text-brand-900 dark:text-brand-400">{ord.id}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{ord.customerName}</td>
                          <td className="py-3.5 px-4 text-slate-600">{ord.salesmanName} ({ord.salesmanId})</td>
                          <td className="py-3.5 px-4 text-right font-extrabold">Quote Pending</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button onClick={() => openInvoiceModal(ord)} className="px-3 py-1 bg-brand-900 text-white rounded font-bold text-[11px]">
                              View Invoice
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 4: Salesmen */}
            {activeTab === 'salesmen' && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Sales Force Account Managers Roster
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {salesmen.map(s => (
                    <div key={s.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-mono font-bold text-amber-600">{s.id}</span>
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-base">{s.name}</h4>
                          <p className="text-xs text-slate-500">{s.region}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">{s.status}</span>
                      </div>

                      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between text-xs">
                        <span>Phone: <strong className="text-slate-900 dark:text-white">{s.phone}</strong></span>
                        <span>Total Volume: <strong className="text-brand-900 dark:text-brand-400 font-bold">{s.salesVolume}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 5: Categories & Companies */}
            {activeTab === 'categories' && (
              <div className="space-y-6">
                
                {/* Company Management Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        Company Filter Management ({brands.length})
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Add or manage companies displayed in the 1st catalog filter dropdown.
                      </p>
                    </div>

                    {/* Add Company Form */}
                    <form onSubmit={handleAddCompanySubmit} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newCompanyInput}
                        onChange={(e) => setNewCompanyInput(e.target.value)}
                        placeholder="Enter Company Name..."
                        className="px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 min-w-[200px]"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow transition-colors flex items-center gap-1 shrink-0"
                      >
                        <Plus className="w-4 h-4" /> Add Company
                      </button>
                    </form>
                  </div>

                  {/* Company Badges Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {brands.map(b => {
                      const itemCount = products.filter(p => p.brand === b.name).length;
                      return (
                        <div key={b.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-amber-500/50 transition-colors">
                          <div>
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white">{b.name}</h4>
                            <span className="text-[10px] text-slate-400">{itemCount} Products</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteBrand(b.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                            title="Delete Company"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Category Management Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        Product Category Filter Management ({categories.length})
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Add or manage product categories displayed in the 2nd catalog filter dropdown.
                      </p>
                    </div>

                    {/* Add Category Form */}
                    <form onSubmit={handleAddCategorySubmit} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newCategoryInput}
                        onChange={(e) => setNewCategoryInput(e.target.value)}
                        placeholder="Enter Category Name..."
                        className="px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 min-w-[200px]"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-brand-900 hover:bg-brand-800 dark:bg-brand-600 text-white font-extrabold text-xs rounded-xl shadow transition-colors flex items-center gap-1 shrink-0"
                      >
                        <Plus className="w-4 h-4" /> Add Category
                      </button>
                    </form>
                  </div>

                  {/* Categories Badges Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {categories.map(c => {
                      const itemCount = products.filter(p => p.category === c.name).length;
                      return (
                        <div key={c.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-brand-500/50 transition-colors">
                          <div>
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white">{c.name}</h4>
                            <span className="text-[10px] text-slate-400">{itemCount} Products</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteCategory(c.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* Tab 6: Inventory Alerts */}
            {activeTab === 'inventory' && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" /> Low Stock & Inventory Health Alerts
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.filter(p => p.stock <= 20).map(p => (
                    <div key={p.id} className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">{p.name}</span>
                        <span className="text-[10px] text-slate-500">SKU: {p.sku} | Stock: <strong className="text-red-600 font-bold">{p.stock} units left</strong></span>
                      </div>
                      <button
                        onClick={() => {
                          updateProduct({ ...p, stock: p.stock + 50 });
                          showToast(`Restocked +50 units for ${p.sku}`, 'success');
                        }}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg"
                      >
                        + Restock 50
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 7: Reports & Settings */}
            {activeTab === 'reports' && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Custom Enterprise Tax & Sales Report Generator
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => showToast('Generated & Downloaded GST Tax Credit Statement PDF', 'success')}
                    className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-left hover:border-amber-500 transition-colors"
                  >
                    <FileText className="w-8 h-8 text-amber-500 mb-2" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Monthly GST Tax Report (GSTR-1)</h4>
                    <p className="text-xs text-slate-500">Download formatted PDF with HSN & Tax breakdown</p>
                  </button>

                  <button
                    onClick={() => showToast('Exported Master Inventory & Sales Excel (.XLSX)', 'success')}
                    className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-left hover:border-brand-500 transition-colors"
                  >
                    <Download className="w-8 h-8 text-brand-500 mb-2" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Full Inventory & Sales Excel Export</h4>
                    <p className="text-xs text-slate-500">Complete raw dataset export for ERP integration</p>
                  </button>
                </div>
              </div>
            )}

          </main>

        </div>

      </div>

      {/* Add / Edit Product Modal */}
      <AnimatePresence>
        {isAddProductOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
                <h3 className="font-bold text-base">{editingProduct ? "Edit Product Details" : "Add New Industrial Product"}</h3>
                <button onClick={() => setIsAddProductOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={prodForm.name}
                    onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-xl text-xs"
                    placeholder="e.g. Bosch GSB 18V Cordless Drill"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Brand</label>
                    <select
                      value={prodForm.brand}
                      onChange={(e) => setProdForm({ ...prodForm, brand: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-xl text-xs font-semibold"
                    >
                      {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Category</label>
                    <select
                      value={prodForm.category}
                      onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-xl text-xs font-semibold"
                    >
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">SKU</label>
                    <input
                      type="text"
                      required
                      value={prodForm.sku}
                      onChange={(e) => setProdForm({ ...prodForm, sku: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-xl text-xs font-mono"
                      placeholder="BSH-101"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Base Price / Rate</label>
                    <input
                      type="number"
                      required
                      value={prodForm.price}
                      onChange={(e) => setProdForm({ ...prodForm, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Stock</label>
                    <input
                      type="number"
                      required
                      value={prodForm.stock}
                      onChange={(e) => setProdForm({ ...prodForm, stock: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-900 text-white font-extrabold text-xs rounded-xl shadow mt-4"
                >
                  Save Product Record
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk CSV Import Modal */}
      <BulkCsvModal isOpen={isCsvModalOpen} onClose={() => setIsCsvModalOpen(false)} />
    </div>
  );
};
