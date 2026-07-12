import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

export default function ProductManager() {
  const [categories, setCategories] = useState([
    { id: 1, name: 'Stream Plus', color: 'from-red-900 to-red-800' },
    { id: 2, name: 'Music', color: 'from-green-900 to-green-800' },
    { id: 3, name: 'Creator', color: 'from-purple-900 to-purple-800' },
  ]);

  const [products, setProducts] = useState({
    1: [
      { id: 1, name: 'Stream Plus555', desc: 'ดูหนังซีรี่ย์ได้ไม่จำกัดเพลิดเพลินไปกว่า 30 วัน', price: 189 },
      { id: 2, name: 'Premium Plus', desc: 'ดูหนังซีรี่ย์ได้ไม่จำกัดเพลิดเพลินไปกว่า 30 วัน', price: 299 },
    ],
    2: [
      { id: 3, name: 'Music Unlimited', desc: 'ฟังเพลงได้ไม่จำกัดในทุกสถานที่เพลิดเพลินไปกว่า 30 วัน', price: 129 },
    ],
    3: [
      { id: 4, name: 'Creator Pro', desc: 'เครื่องมือสร้างสรรค์สำหรับครีเอเตอร์เพลิดเพลินไปกว่า 30 วัน', price: 159 },
    ],
  });

  const [selectedCategory, setSelectedCategory] = useState(1);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);

  const categoryColors = ['from-red-900 to-red-800', 'from-green-900 to-green-800', 'from-purple-900 to-purple-800', 'from-blue-900 to-blue-800', 'from-pink-900 to-pink-800'];

  const addCategory = () => {
    if (newCategoryName.trim()) {
      const newId = Math.max(...categories.map(c => c.id), 0) + 1;
      setCategories([...categories, {
        id: newId,
        name: newCategoryName,
        color: categoryColors[categories.length % categoryColors.length]
      }]);
      setProducts({ ...products, [newId]: [] });
      setNewCategoryName('');
      setShowAddCategory(false);
      setSelectedCategory(newId);
    }
  };

  const addProduct = () => {
    if (showAddProduct) {
      const newId = Math.max(...Object.values(products).flatMap(p => p.map(x => x.id)), 0) + 1;
      const currentProducts = products[selectedCategory] || [];
      setProducts({
        ...products,
        [selectedCategory]: [...currentProducts, {
          id: newId,
          name: 'New Product',
          desc: 'Add product description',
          price: 0
        }]
      });
    }
  };

  const deleteCategory = (id) => {
    if (categories.length > 1) {
      const newCategories = categories.filter(c => c.id !== id);
      setCategories(newCategories);
      const newProducts = { ...products };
      delete newProducts[id];
      setProducts(newProducts);
      if (selectedCategory === id) {
        setSelectedCategory(newCategories[0].id);
      }
    }
  };

  const deleteProduct = (productId) => {
    setProducts({
      ...products,
      [selectedCategory]: products[selectedCategory].filter(p => p.id !== productId)
    });
  };

  const currentProducts = products[selectedCategory] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">จัดการหมวดและสินค้า</h1>

          {/* Categories Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  selectedCategory === cat.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.name}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCategory(cat.id);
                  }}
                  className="hover:bg-red-500 hover:bg-opacity-20 rounded p-0.5"
                >
                  <X size={16} />
                </button>
              </button>
            ))}

            {/* Add Category Button */}
            {!showAddCategory ? (
              <button
                onClick={() => setShowAddCategory(true)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium whitespace-nowrap flex items-center gap-2 transition-all"
              >
                <Plus size={18} /> เพิ่มหมวด
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="ชื่อหมวด..."
                  className="px-3 py-2 rounded border border-gray-300 text-sm"
                  autoFocus
                />
                <button
                  onClick={addCategory}
                  className="px-3 py-2 rounded bg-orange-500 text-white text-sm font-medium hover:bg-orange-600"
                >
                  บันทึก
                </button>
                <button
                  onClick={() => setShowAddCategory(false)}
                  className="px-3 py-2 rounded bg-gray-200 text-gray-700 text-sm font-medium"
                >
                  ยกเลิก
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Product Cards */}
          {currentProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow">
              <div className={`bg-gradient-to-br ${categories.find(c => c.id === selectedCategory)?.color || 'from-gray-700 to-gray-600'} h-40 flex items-center justify-center relative`}>
                <div className="text-5xl opacity-20 text-white">{product.name[0]}</div>
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-4">
                <p className="text-orange-500 text-xs font-semibold mb-1">
                  {categories.find(c => c.id === selectedCategory)?.name}
                </p>
                <h3 className="font-bold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.desc}</p>
                <div className="flex justify-between items-center">
                  <span className="text-orange-500 font-bold">฿{product.price}</span>
                  <button className="bg-orange-100 hover:bg-orange-200 text-orange-500 rounded-lg p-2 transition-colors">
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add Product Button */}
          <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-all">
            <button
              onClick={() => setShowAddProduct(!showAddProduct)}
              className="w-full h-full min-h-64 flex flex-col items-center justify-center bg-gradient-to-br from-gray-300 to-gray-200 hover:from-gray-400 hover:to-gray-300 transition-all"
            >
              <Plus size={48} className="text-gray-400 mb-2" />
              <span className="text-gray-500 text-sm font-medium">เพิ่มสินค้า</span>
            </button>
          </div>
        </div>

        {/* Add Product Confirmation */}
        {showAddProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-bold mb-4">เพิ่มสินค้าใหม่</h3>
              <p className="text-gray-600 mb-6">ยืนยันการเพิ่มสินค้าใหม่ในหมวด "{categories.find(c => c.id === selectedCategory)?.name}"?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    addProduct();
                    setShowAddProduct(false);
                  }}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 rounded-lg transition-colors"
                >
                  ยืนยัน
                </button>
                <button
                  onClick={() => setShowAddProduct(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}