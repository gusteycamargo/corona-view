import 'bootstrap/dist/css/bootstrap.css';
import React, { useEffect, useState } from 'react';
import './App.css';
import './styles/global.css';
import axios from 'axios';
import { FaSkull, FaMapMarkerAlt, FaCheck } from 'react-icons/fa';

function App() {
  const [arrayCorona, setArrayCorona] = useState([]);

  useEffect(() => {
    async function retrieveData() {
      await axios.get("https://brasil.io/api/dataset/covid19/caso/data?is_last=True&state=PR&city=Paranaguá")
      .then(function (response) {
          setArrayCorona(response.data.results[0]);
          console.log(response.data.results[0]);
          
      })
      .catch(function (error) {
          console.log(error)
      });
    }

    retrieveData();
  }, []);

  


  return (
    <div className="container-fluid">
      <div className="card">
        <p> <FaMapMarkerAlt/> Cidade: {arrayCorona.city}</p>
        <p> <FaCheck/> Confirmados: {arrayCorona.confirmed}</p>
        <p> <FaSkull/> Mortes: {arrayCorona.deaths}</p>
        <p>Atualizado em: {arrayCorona.date}</p>
      </div>
    </div>
  );
}

export default App;
