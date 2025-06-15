import './NotFoundPage.css';
import NavBar from './NavBar';


const NotFoundPage = () => {


  return (
    <>
      <NavBar />

      <div style={{ textAlign: 'center', padding: '60px 20px' }}>

        <h1 style={{ fontSize: '4rem', marginBottom: '20px' }}>404</h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '30px' }}>
          Page Not Found
        </p>
      </div>
    </>

  )

}




export default NotFoundPage;
