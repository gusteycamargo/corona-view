import 'bootstrap/dist/css/bootstrap.css';
import React, { useEffect, useState } from 'react';
import './App.css';
import './styles/global.css';
import axios from 'axios';
import cep from 'cep-promise'
import { FaSkull, FaMapMarkerAlt, FaCheck } from 'react-icons/fa';
import Skeleton from 'react-loading-skeleton';
import { Combobox } from 'react-widgets';
import 'react-widgets/dist/css/react-widgets.css';
import Header from './components/Header/index';
import Footer from './components/Footer/index';

function App() {
  const [arrayCorona, setArrayCorona] = useState([]);
  const [coords, setCoords] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [states, setStates] = useState([]);
  const [state, setState] = useState('');
  const [cities, setCities] = useState([]);
  const [citySelected, setCitySelected] = useState('');
  const MESSAGES = {
    emptyList: "Escolha um estado primeiro!"
  }

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
        timeout: 5000,
      }
    )
  }, []);

  useEffect(() => {
    async function getStates() {
      await axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then(function (response) {
          setStates(response.data);
      })
      .catch(function (error) {
          console.log(error)
      });
    }

    getStates();
  }, []);

  useEffect(() => {
    async function getCities() {
      await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state.id}/municipios`)
      .then(function (response) {
          setCities(response.data);          
      })
      .catch(function (error) {
          console.log(error)
      });
    }

    getCities();
  }, [state]);

  useEffect(() => {
    async function getCity() {
      const key = process.env.REACT_APP_KEY_API;
      setIsLoading(true);
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
    setIsLoading(true);
    await axios.get(`https://brasil.io/api/dataset/covid19/caso/data?is_last=True&state=${state}&city=${city}`)
    .then(function (response) {
      if(response.data.results.length <= 0) {
        setArrayCorona({
          city: undefined
        })
      } 
      else {
        setArrayCorona(response.data.results[0]);
      }
    })
    .catch(function (error) {
        console.log(error)
    });
    setIsLoading(false);
  }

  function formatDateString (string) {
    try{
      const input = string.split("-");  // ex input "2010-01-18"
      return input[2]+ "/" +input[1]+ "/" +input[0]; 
    }
    catch(err) {
      return "xx/xx/xxxx"
    }
  }

  return (
    <>
        <Header/>
        <div className="container-fluid">
            <div className="row">
              <Combobox 
                  textField='sigla' 
                  data={states} 
                  onChange={setState}
                  value={state}
                  placeholder="Estado" 
                  emptyList="Sem dados"
              />
              <Combobox 
                  textField='nome' 
                  messages={MESSAGES}
                  data={cities} 
                  onChange={setCitySelected}
                  value={citySelected}
                  placeholder="Cidade" 
              />
              <button onClick={() => retrieveData(citySelected.nome, state.sigla)} className="button">Filtrar</button>
            </div>

            <div className="card">
              <div>
                {(isLoading) ? (
                  <>
                    <p> <Skeleton/> </p>
                    <p> <Skeleton/> </p>
                    <p> <Skeleton/> </p>
                  </>
                ) : (
                  <>
                    {(arrayCorona.city === undefined) ? (
                        <p> <FaMapMarkerAlt/> Sem dados para essa cidade</p>
                    ) : (
                      <>
                        <p> <FaMapMarkerAlt/> Cidade: {arrayCorona.city}</p>
                        <p> <FaCheck/> Confirmados: {arrayCorona.confirmed}</p>
                        <p> <FaSkull/> Mortes: {arrayCorona.deaths}</p>
                      </>
                    )
                      
                    }
                  </>
                )}
              </div>
              <div className="footer">
                {(isLoading) ? (
                  <p> <Skeleton/> </p>
                ) : (
                  <p>Atualizado em: {formatDateString(arrayCorona.date)}</p>
                )}
              </div>
            </div>
        </div>
        <Footer/>
    </>
  );
}

export default App;
