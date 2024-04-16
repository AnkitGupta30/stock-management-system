"use client";
import Image from "next/image";
import Header from "../components/Header"
import { useEffect, useState } from "react";

export default function Home() {
  const [productForm, setProductForm] = useState({});
  const [products, setProducts] = useState([]);
  const [alert, setAlert] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [dropdown, setDropdown] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch("/api/product");
      let rjson = await response.json();
      setProducts(rjson.products);
    };
    fetchProducts();
  }, []);

  const addProduct = async (e) => {
  
    e.preventDefault();
    try {
      const response = await fetch("/api/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productForm),
      });
      if (response.ok) {
        // console.log("Product added successfully");
        setAlert("Your Product has been added");
        setProductForm({});
      } else {
        console.error("Failed to add product");
        // Handle error scenario
      }
    } catch (error) {
      console.error("Error:", error);
    }
      // fetch all te product to sync back 
      const response = await fetch("/api/product");
      let rjson = await response.json();
      setProducts(rjson.products);
  };

  const handleChange = (e) => {
    setProductForm({ ...productForm, [e.target.name]: e.target.value });
  };

  const onDropDownEdit = async (e) => {
    let value = e.target.value
    setQuery(value);
    if (value.length > 3) {
      setLoading(true);
      setDropdown([]);
      const response = await fetch("/api/search?query=" + query);
      let rjson = await response.json();
      setDropdown(rjson.products);
      setLoading(false);
    }
    else{
      setDropdown([]);
    }
  };

  const buttonAction = async (action, slug, intialQantity) => {
    // immediately change the product in products
    let index = products.findIndex((item)=>item.slug == slug);
    let newProducts = JSON.parse(JSON.stringify(products))
    if(action == "plus"){
    newProducts[index].quantity = parseInt(intialQantity) + 1;
  }
  else{
      newProducts[index].quantity = parseInt(intialQantity) - 1;
    }
    setProducts(newProducts)

    // immediately change the product in dropDown
    let indexdrop = dropdown.findIndex((item)=>item.slug == slug);
    let newDropDown = JSON.parse(JSON.stringify(dropdown))
    if(action == "plus"){
      newDropDown[indexdrop].quantity = parseInt(intialQantity) + 1;
  }
  else{
    newDropDown[indexdrop].quantity = parseInt(intialQantity) - 1;
    }
    setDropdown(newDropDown)
    console.log(action, slug)
    setLoadingAction(true);
    const response = await fetch("/api/action", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({action, slug, intialQantity}),
    });
    let r = await response.json()
    console.log(r);
    setLoadingAction(false);
  }
  

  return (
    <>
      <Header/>
      {/* CurrentStock  */}
      <div className="container mx-auto max-w-screen-lg px-[1rem] md:px-[2rem] lg:px-0">
        <div className="text-green-800 text-center">{alert}</div>
        <h1 className="text-2xl font-semibold mb-6">Search a Product</h1>
        <div className="flex mb-2 flex-col lg:flex-row">
          <input
            onChange={onDropDownEdit}
            type="text"
            name="productname"
            placeholder="Enter a product name"
            className="border border-gray-300 px-4 w-full outline-none"
          />
          <select className="border hidden lg:block border-gray-300 px-4 py-1 rounded-r-md">
            <option value="all">All</option>
            <option value="category1">Category 1</option>
            <option value="category2">Category 2</option>
          </select>
        </div>
        {loading && (
          <div className="flex justify-center items-center">
            <svg
              width="30px"
              height="30px"
              viewBox="0 0 66 66"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                fill="none"
                stroke="#000000"
                strokeWidth="6"
                strokeLinecap="round"
                cx="33"
                cy="33"
                r="30"
              >
                <animate
                  attributeName="stroke-dasharray"
                  attributeType="XML"
                  from="1,150"
                  to="150,150"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="stroke-dashoffset"
                  attributeType="XML"
                  from="0"
                  to="-150"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          </div>
        )}
        <div className="dropcontainer absolute border-1 w-[70vw] bg-purple-100 rounded-md">
          {dropdown.map((item) => {
            return (
              <div
                className="container flex justify-between my-1 p-2 border border-b-2"
                key={item.slug}
              >
                <span className="slug">
                  {item.slug} ({item.quantity} availabe for ₹{item.price})
                </span>
                <div className="mx-5 flex justify-center items-center gap-2">
                  <button onClick={()=>{buttonAction("minus", item.slug, item.quantity)}} disabled={loadingAction} className="subtract inline-block px-3 py-1 bg-purple-500 text-white font-semibold rounded-lg shadow-md cursor-pointer disabled:bg-purple-200">
                    -
                  </button>
                  <span className="quantity inline-block w-3">
                    {item.quantity}
                  </span>
                  <button onClick={()=>{buttonAction("plus", item.slug, item.quantity)}} disabled={loadingAction} className="add inline-block px-3 py-1 bg-purple-500 text-white font-semibold rounded-lg shadow-md cursor-pointer disabled:bg-purple-200">
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="container mx-auto max-w-screen-lg px-[1rem] lg:px-0 md:px-[2rem]">
        <h1 className="text-2xl font-semibold mb-6">Add a product</h1>
        <form action="">
          <div className="mb-4">
            <label htmlFor="productName" className="block mb-2">
              Product Slag
            </label>
            <input
              name="slug"
              type="text"
              id="productName"
              className="w-full border border-gray-300 px-4 py-1 outline-none"
              onChange={handleChange}
              value={productForm.slug || ""}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="productName" className="block mb-2">
              Quantity
            </label>
            <input
              name="quantity"
              type="number"
              id="quantityName"
              className="w-full border border-gray-300 px-4 py-1 outline-none"
              onChange={handleChange}
              value={productForm.quantity || ""}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="priceName" className="block mb-2">
              Price
            </label>
            <input
              name="price"
              type="number"
              id="priceName"
              className="w-full border border-gray-300 px-4 py-1 outline-none"
              onChange={handleChange}
              value={productForm.price || ""}
            />
          </div>
          <button
            onClick={addProduct}
            type="submit"
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 border rounded-md"
          >
            Add Product
          </button>
        </form>
      </div>
      <div className="container mx-auto max-w-screen-lg my-5 px-[1rem] md:px-[2rem] lg:px-0">
        <h1 className="text-2xl font-semibold mb-6">Display Current Stock</h1>
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">Product Name</th>
              <th className="px-4 py-2">Quantity</th>
              <th className="px-4 py-2">Price</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              return (
                <tr key={product.slag}>
                  <td className="border px-4 py-2">{product.slug}</td>
                  <td className="border px-4 py-2">{product.quantity}</td>
                  <td className="border px-4 py-2">₹{product.price}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
