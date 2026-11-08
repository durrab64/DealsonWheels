import React from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';

const Sidebar = ({ categories, activeCategory }) => {
  const { type } = useParams();

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full md:w-64 flex-shrink-0"
    >
      <div className="sticky top-24">
        <h3 className="text-xl font-bold mb-4 px-4">Categories</h3>
        <nav className="space-y-1">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${type}/${category.id}`}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 group ${activeCategory === category.id
                ? 'bg-white text-black font-medium shadow-lg scale-105'
                : 'text-gray-400 hover:bg-zinc-900 hover:text-white hover:pl-6'
                }`}
            >
              <category.icon size={20} />
              <span>{category.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
