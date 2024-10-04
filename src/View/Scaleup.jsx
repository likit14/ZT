import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios'; // Import axios for API calls
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowsRotate } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../Components/sidebar";
import styles from "../Styles/Scaleup.module.css"; // Import CSS Modules

const DataTable = () => {
    const [selectedRows, setSelectedRows] = useState([]);
    const [nodes, setNodes] = useState([]); // Initialize as an empty array
    const [validationResults, setValidationResults] = useState({});
    const [validatingNode, setValidatingNode] = useState(null);
    const [isScanning, setIsScanning] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;
    const navigate = useNavigate();
    const [isRotating, setIsRotating] = useState(false);

    // useEffect(() => {
    //     scanNetwork();
    // }, []);

    // const scanNetwork = async () => {
    //     setIsScanning(true);
    //     try {
    //         const response = await axios.get('http://127.0.0.1:8000/');
    //         console.log('API Response:', response.data); // Log the API response
    //         if (response.data.status === 'success' && Array.isArray(response.data.message)) {
    //             setNodes(response.data.message);
    //         } else {
    //             console.error('Unexpected response format:', response.data);
    //             setNodes([]); // Ensure nodes is always an array
    //         }
    //         setValidationResults({});
    //     } catch (error) {
    //         console.error('Error scanning network:', error);
    //         setNodes([]); // Ensure nodes is always an array in case of error
    //     } finally {
    //         setIsScanning(false);
    //     }
    // };
    
    const handleCheckboxChange = (event, node) => {
        const isChecked = event.target.checked;
        if (isChecked) {
            setSelectedRows([...selectedRows, node]);
        } else {
            setSelectedRows(selectedRows.filter(selectedRow => selectedRow.ip !== node.ip));
        }
    };

    const validateNode = async (node) => {
        setValidatingNode(node);
        try {
            const response = await axios.post('http://127.0.0.1:8000/validate', { ip: node.ip });
            setValidationResults(prevResults => ({
                ...prevResults,
                [node.ip]: response.data
            }));
        } catch (error) {
            console.error('Error validating node:', error);
            setValidationResults(prevResults => ({
                ...prevResults,
                [node.ip]: { status: 'failure', message: 'Validation failed due to an error.' }
            }));
        } finally {
            setValidatingNode(null);
        }
    };

    const handleRefresh = () => {
        // scanNetwork();
        setIsRotating(true);
        setTimeout(() => {
            setIsRotating(false);
        }, 1000);
    };

    const handleDeploy = () => {
        navigate('/DesignatedNode', { state: { selectedNodes: selectedRows } });
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
    
    const paginatedNodes = (Array.isArray(nodes) ? nodes : []).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div>
            <div className={styles.header}>
                <button className={styles["back-button"]} onClick={handleBack}>
                    <FontAwesomeIcon icon={faArrowLeft} size="2x" />
                </button>
                <center>
                    <h1>Scale Up
                        <button className={`button ${isRotating ? 'rotating' : ''}`} onClick={handleRefresh}>
                            <FontAwesomeIcon icon={faArrowsRotate} size="2x" />
                        </button>
                    </h1>
                </center>
            </div>
            <div className={styles.main}>
                <div className={styles["data-table-container"]}>
                    <div className={styles.container}>
                        <div>
                            <table className={styles["data-table"]}>
                                <thead>
                                    <tr>
                                        <th>Sl No.</th>
                                        <th>IP Address</th>
                                        <th>Validate</th>
                                        <th>Validation<br />Result</th>
                                        <th>Info</th>
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
                                            <td>
                                                <button 
                                                    disabled={validatingNode !== null && validatingNode.ip === node.ip}
                                                    onClick={() => validateNode(node)}
                                                >
                                                    {validatingNode !== null && validatingNode.ip === node.ip ? 'Validating...' : 'Validate'}
                                                </button>
                                            </td>
                                            <td style={{ color: 'red', fontFamily: 'Arial, sans-serif' }}>
                                                {validationResults[node.ip] ? validationResults[node.ip].status : 'Not validated'}
                                            </td>
                                            <td>
                                                {validationResults[node.ip] && validationResults[node.ip].status === 'failure' && (
                                                    <button onClick={() => alert(validationResults[node.ip].message)}>Info</button>
                                                )}
                                            </td>
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
                                className={styles["next-button"]}
                                onClick={handleDeploy}
                                disabled={selectedRows.length === 0}
                            >
                                <strong>SCALE UP</strong>
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
