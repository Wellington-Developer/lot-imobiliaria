import { useEffect, useRef, useState, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiMapPin } from "react-icons/fi";
import { MdOutlineVerified } from "react-icons/md";
import { UserContext } from '../../UserContext';
import { ButtonForm } from '../Forms/Button';
import { motion } from 'framer-motion';
import { FaArrowRight, FaArrowLeft, FaChartArea, FaInfoCircle, FaWhatsapp } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { GoHomeFill } from "react-icons/go";
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import './style.css';
export const PostPage = () => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyAArItYyvL1J4Ggx0HjpGqOorWCgY07cRk', 
  });

  const container = useRef();
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [modal, setModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const user = useContext(UserContext);
  const [widthImages, setWidthImages] = useState(0);
  const [limiteLines, setLimiteLines] = useState(false);

  const handleThumbnailClick = (thumbnail) => {
    setSelectedImage(thumbnail);
  };

  const handleModal = () => {
    setModal(!modal);
  };

  const fetchData = async () => {
    try {
      const response = await fetch(`https://huergo.com.br/lot-api/json/api/photo/${id}`);
      if (response.ok) {
        const json = await response.json();
        setData(json.photo);
      } else {
        console.error('Erro ao carregar os dados:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao processar a solicitação:', error);
    }
  };

  const scrollLeft = () => {
    container.current.scrollLeft -= 100;
  };

  const scrollRight = () => {
    container.current.scrollLeft += 100;
  };

  const handleScrollDown = () => {
    window.scrollBy(0, 1500);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const updateWidth = () => {
      setWidthImages(container.current?.scrollWidth - container.current?.offsetWidth);
    };

    updateWidth();
  }, [data]);

  const [location, setLocation] = useState({
    lat: 0,
    lng: 0,
  });

  useEffect(() => {
    if (isLoaded && !googleMapsLoaded && data.localidade && data.cidade && data.bairro) {
      setGoogleMapsLoaded(true);
      const geocoder = new window.google.maps.Geocoder();
      const address = `${data.localidade}, ${data.cidade}, ${data.bairro}`;
      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK" && results.length > 0) {
          setLocation({
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          });
        } else {
          console.error('Erro ao geocodificar endereço:', status);
        }
      });
    }
  }, [isLoaded, data, googleMapsLoaded]);  

  return (
    data ? 
    (
      <div className="post-page__container">
        <div className="post-page__intro container">
          <div className="post-left__intro animeLeft">
            <div
                className={`zoom-container ${isHovered ? 'zoomed' : ''}`}
            >
              {
                selectedImage ? 
                (<img key={selectedImage} src={selectedImage} alt={`Imagem Grande`} onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}/>) :
                (data.imagens_relacionadas && <img src={data.imagens_relacionadas[0]} onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}/>)
              }
            </div>
            <motion.div ref={container} className="thumbnails-container"
            whileTap={{ cursor: "grabbing" }}>
              <motion.div className="posts-wrapper" drag="x" dragConstraints={{ right: 0, left: -widthImages }}>
              {data.imagens_relacionadas && data.imagens_relacionadas.map((thumbnail, index) => (
                <img
                  key={index}
                  src={thumbnail}
                  alt={`Thumbnail ${index}`}
                  className={`thumbnail ${thumbnail === selectedImage ? 'selected' : ''}`}
                  onClick={() => handleThumbnailClick(thumbnail)}
                />
              ))}
              </motion.div>
            </motion.div>
              {widthImages > 0 && (
                <div className="container-button__controller">
                  <button className="scroll-button left" onClick={scrollLeft}>
                    <FaArrowLeft />
                  </button>
                  <button className="scroll-button right" onClick={scrollRight}>
                    <FaArrowRight />
                  </button>
                </div>
              )}
          </div>
          <div className="post-right__intro">
            {
              (user.data && data.author) && (data.author == user.data.username || user.data.username == "admin" ) ?
              (
                <Link to={`/account/edit-post/${id}`}>
                  <ButtonForm inner="Editar post" style={{ 'marginBottom': 30 }}/>
                </Link>
              )
              :
              (
                ''
              )
            }
            {
                data.locacao_ou_venda === 'Venda' ?
                (<p id="venda-aluguel">
                  {
                    'Venda'
                  }
                </p>)
                :
                (<p id="venda-aluguel">
                  {
                    'Aluguel'
                  }
                </p>)
              }
            <div className="post-info__title">
              <h3 className="post-price">{Number(data.preco).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}</h3>
              <FaInfoCircle onClick={handleModal} />
            <div className={ modal ? 'modal activeModal' : 'modal' }>
              <div className="modal-inner">
              <FaXmark onClick={handleModal} />
              <h1>{data.informacao_adicional_titulo}</h1>
              {
                console.log(data)
              }
              <p>{data.informacao_adicional_paragrafo}</p>
              </div>
            </div>
            </div>
              <div className="info-down__title">
                {
                  data.texto_adicional ?
                  (
                    <div className="text-adicional">
                      {
                        data.texto_adicional.split('-').map((item) => {
                          return <p>{item}</p>
                        })
                      }
                    </div>
                  ) :
                  (
                    <p></p>
                  )
                }
              </div>
            <h1 className="post-title">{data.title}</h1>
            <p className="post-locale">
              <FiMapPin />{data.localidade}</p>
            <p className="post-description">{data.descricao_completa}</p>
            <a onClick={handleScrollDown} className="button">MAIS INFORMAÇÕES
            </a>
          </div>  
        </div>

        <div className="features-post__container" id="features">
          <div className="container">
            <div className="features-post__container">
              <div className="features-left__side">
              <h1>Caracteristicas</h1>
              <ul>
                {
                  data.features && data.features.split(',').map((item, index) => {
                    return <li><MdOutlineVerified />{item}</li>
                  })
                }
              </ul>
            </div>
            <div className="features-right__side">
              <div className="box">
                <GoHomeFill />
                <h1>{data.qtd_salas}</h1>
                <p>salas</p>
              </div>
              <div className="box">
                <GoHomeFill />
                <h1>{data.qtd_banheiros && data.qtd_banheiros}</h1>
                <p>banheiros</p>
              </div>
              <div className="box">
                <GoHomeFill />
                <h1>{data.qtd_quartos && data.qtd_quartos}</h1>
                <p>quartos</p>
              </div>
              <div className="box">
                <GoHomeFill />
                <h1>{data.qtd_vagas && data.qtd_vagas}</h1>
                <p>vagas</p>
              </div>
              <div className="box">
                <FaChartArea />
                <h1>{data.metros_privativos && data.metros_privativos}</h1>
                <p>privativos</p>
              </div>
              <div className="box">
                <FaChartArea />
                <h1>{data.metros_totais && data.metros_totais}</h1>
                <p>totais</p>
              </div>
            </div>
            </div>
          </div>
        </div>
      
        <div className="complete-description__section container">
          <h1>Descrição completa</h1>
          <p className={limiteLines ? 'fullDesc' : 'normalDesc'}>{data.descricao_completa}</p>
          <h3 id="view-more" onClick={() => setLimiteLines(!limiteLines)}>Ver mais</h3>
        </div>

        <div className="map-post__section container">
          <div className="left-side__map">
            <h1>Localidade</h1>
            <ul>
              {
                data.localidade
              }
            </ul>

            <div className="contact-locale">
              <h1>Fale com a gente</h1>
              <div className="cnt">
                <a href="https://wa.me/5541995143839" target='_blank'>
                <FaWhatsapp />
              </a>
              <p>(41) 99514-3839</p>
              </div>
            </div>
          </div>

          <div className="right-side__map">
            { 
              isLoaded ? (
                <GoogleMap
                  mapContainerStyle={{width: '100%', height: '100%'}}
                  center={location}
                  zoom={15}
                >
                  <Marker position={location} />
                </GoogleMap>
              ) : <></>
            }
          </div>
        </div>
      </div>

    )
    :
    (
      <h1>Carregando</h1>
    )
  );
}