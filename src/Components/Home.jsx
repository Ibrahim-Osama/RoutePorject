import React, { useEffect, useState } from 'react';
import { Chart as ChartJS } from "chart.js/auto";
import { Bar } from "react-chartjs-2";
import axios from 'axios';

const Home = () => {
  const [hambozo, sethambozo] = useState([]);
  const [hambozotransaction, sethambozotransaction] = useState([]);
  const [mergedData, setMergedData] = useState([]);
  const [originalMergedData, setOriginalMergedData] = useState([]); // حالة جديدة للاحتفاظ بالبيانات الأصلية
  const [search, setSearch] = useState('');

  const getData = async () => {
    try {
      const res = await axios.get('http://localhost:3001/customers');
      sethambozo(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const getDataactions = async () => {
    try {
      const res = await axios.get('http://localhost:3001/transactions');
      sethambozotransaction(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const mergeData = (customers, transactions) => {
    const merged = customers.map((customer) => {
      const customerTransactions = transactions.filter(
        (tran) => tran.customer_id == customer.id
      );
      return {
        ...customer,
        transactions: customerTransactions,
      };
    });
    setMergedData(merged);
    setOriginalMergedData(merged);
  };

  useEffect(() => {
    getData();
    getDataactions();
  }, []);

  useEffect(() => {
    if (hambozo.length > 0 && hambozotransaction.length > 0) {
      mergeData(hambozo, hambozotransaction);
    }
  }, [hambozo, hambozotransaction]);

  const handleSearch = (e) => {
    const searchInput = e.target.value;
    setSearch(searchInput);

    if (searchInput.length !== 0) {
      if (isNaN(searchInput)) {
        const filteredData = originalMergedData.filter((customer) =>
          customer.name.toLowerCase().includes(searchInput.toLowerCase())
        );
        setMergedData(filteredData);
      }
       else 
       {
        const filteredData = originalMergedData.filter((customer) =>
          customer.transactions.some((transaction) =>
            transaction.amount.toString().includes(searchInput)
          )
        );
        setMergedData(filteredData);
      }
    } else {
      setMergedData(originalMergedData); 
    }
  };

  return (
    <>
      <input
        onChange={handleSearch}
        type="text"
        className='form-control w-50 mt-4 mx-auto'
        placeholder='Search By Name Or Transaction'
        value={search}
      />
      <table className="table text-center table-dark table-striped table-hover container mt-5">
        <thead>
          <tr>
            <th scope="col">#ID</th>
            <th scope="col">Name</th>
            <th scope="col">Transactions</th>
          </tr>
        </thead>
        <tbody>
          {mergedData.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>
                {item.transactions.length > 0 ? (
                  <ul>
                    {item.transactions.map((transaction, index) => (
                      <li key={index}>
                        {transaction.amount} (Transaction ID: {transaction.id})
                      </li>
                    ))}
                  </ul>
                ) : (
                  'No transactions'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className='w-50 container'>
        <Bar
          data={{
            labels: mergedData.map((customer) => customer.name),
            datasets: [
              {
                label: 'Transaction Amount',
                data: mergedData.map((customer) =>
                  customer.transactions.reduce(
                    (total, transaction) => total + transaction.amount,
                    0
                  )
                ),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
              },
            ],
          }}
        />
      </div>
    </>
  );
};

export default Home;
