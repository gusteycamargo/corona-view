import 'bootstrap/dist/css/bootstrap.css';
import React, { useEffect, useState } from 'react';
import './App.css';
import './styles/global.css';
import axios from 'axios';
import cep from 'cep-promise'
import { FaSkull, FaMapMarkerAlt, FaCheck } from 'react-icons/fa';

function App() {
  const [arrayCorona, setArrayCorona] = useState([]);
  const [coords, setCoords] = useState({});

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude} = position.coords;
        setCoords({
          latitude,
          longitude
        });      
      },
      (err) => {
        console.log(err);
      },
      {
        timeout: 30000,
      }
    )
  }, []);

  useEffect(() => {
    async function getCity() {
      const key = process.env.REACT_APP_KEY_API;

      await axios.get(`https://us1.locationiq.com/v1/reverse.php?key=${key}&lat=${coords.latitude}&lon=${coords.longitude}&format=json`)
      .then(function (response) {
          cep(response.data.address.postcode)
          .then(function(response) {
            retrieveData(response.city, response.state);
          });
      })
      .catch(function (error) {
          console.log(error)
      });
    }

    getCity();
  }, [coords]);


  async function retrieveData(city, state) {
    await axios.get(`https://brasil.io/api/dataset/covid19/caso/data?is_last=True&state=${state}&city=${city}`)
    .then(function (response) {
        setArrayCorona(response.data.results[0]);
    })
    .catch(function (error) {
        console.log(error)
    });
  }

  return (
    <div className="container-fluid">
      <div className="card">
        <div>
          <p> <FaMapMarkerAlt/> Cidade: {arrayCorona.city}</p>
          <p> <FaCheck/> Confirmados: {arrayCorona.confirmed}</p>
          <p> <FaSkull/> Mortes: {arrayCorona.deaths}</p>
        </div>
        <div className="footer">
          <p>Atualizado em: {arrayCorona.date}</p>
        </div>
      </div>
    </div>
  );
}

export default App;
