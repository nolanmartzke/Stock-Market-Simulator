import React from 'react';
import { Search, PlusCircle, ArrowRightCircle } from 'lucide-react';
import { useNavigate, useParams, Link } from "react-router-dom"; 
import { Button, Container, Form, Row, Col } from "react-bootstrap";


const Stock = () => { 
    const { ticker } = useParams(); 

    return ( 
        <div className="container-fluid py-4"> 
            
                <div className="card shadow-lg border-0">
                    <div className="card-body p-5">
                        <h1>{ticker}</h1> 
                    </div>
                </div>

        </div> 
    ) 
} 
    
    
    
export default Stock