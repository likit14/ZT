import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Components/sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import '../Styles/NetworkScanner.css';

const DataTable = () => {
    const [selectedRows, setSelectedRows] = useState([]);
    const [nodes, setNodes] = useState([]);
    const [validationResults, setValidationResults] = useState({});
    const [validatingNode, setValidatingNode] = useState(null);
    const [isScanning, setIsScanning] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;
    const navigate = useNavigate();
    const [isRotating, setIsRotating] = useState(false);

    useEffect(() => {
        scanNetwork();
    }, []);

    const scanNetwork = async () => {
        setIsScanning(true);
        try {
            const response = await axios.get('http://192.168.249.101:8000/scan');
            setNodes(response.data);
            setValidationResults({});
        } catch (error) {
            console.error('Error scanning network:', error);
        } finally {
            setIsScanning(false);
        }
    };

    const handleCheckboxChange = (event, node) => {
        const isChecked = event.target.checked;
        if (isChecked) {
            setSelectedRows([...selectedRows, node]);
        } else {
            setSelectedRows(selectedRows.filter(selectedRow => selectedRow.ip !== node.ip));
        }
    };

    const handleRefresh = () => {
        scanNetwork();
        setIsRotating(true);
        setTimeout(() => {
            setIsRotating(false);
        }, 1000);
    };

    const handleDeploy = () => {
        navigate('/validation', { state: { selectedNodes: selectedRows } });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBack = () => {
        navigate(-1); // Navigate to the previous page in history
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100); // Delay to ensure navigation completes before scrolling
    };
    
    
    const paginatedNodes = nodes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div>
            <div className='header'>
                <button className="back-button" onClick={handleBack}>
                    <FontAwesomeIcon icon={faArrowLeft} size="2x" />
                </button>
                <center>
                    <h1>Discovered Machines
                        <button className={`button ${isRotating ? 'rotating' : ''}`} onClick={handleRefresh}>
                            <FontAwesomeIcon icon={faArrowsRotate} size="2x" />
                        </button>
                    </h1>
                </center>
            </div>
            <div className='main'>
                <div className="data-table-container">
                    <div className="container">
                        <div>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Sl No.</th>
                                        <th>IP Address</th>
                                        <th>Select</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isScanning && (
                                        <tr>
                                            <td colSpan="8" className="scanning-message"><center>Scanning...</center></td>
                                        </tr>
                                    )}
                                    {!isScanning && nodes.length === 0 && (
                                        <tr>
                                            <td colSpan="8" className="no-device-message"><center>No device found</center></td>
                                        </tr>
                                    )}
                                    {!isScanning && paginatedNodes.map((node, index) => (
                                        <tr key={node.ip}>
                                            <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                            <td>{node.ip}</td>
                                            <td className="checkbox-column">
                                                <label className="checkbox-label">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRows.some(selectedRow => selectedRow.ip === node.ip)}
                                                        onChange={(event) => handleCheckboxChange(event, node)}
                                                    />
                                                    <span className="checkbox-custom"></span>
                                                </label>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="pagination">
                                {Array.from({ length: Math.ceil(nodes.length / itemsPerPage) }, (_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handlePageChange(i + 1)}
                                        className={currentPage === i + 1 ? 'active' : ''}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                className="next-button"
                                onClick={handleDeploy}
                                disabled={selectedRows.length === 0}
                            >
                                <strong>Next</strong>
                            </button>
                        </div>
                        <Sidebar />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataTable;
