import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../Components/sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import styles from "../Styles/Validation.module.css";
import Swal from 'sweetalert2';
// import validationData from '../Comparison/sample.json'
import requirementData from '../Comparison/min_requirements.json'

const Validation = () => {
    const [selectedRows, setSelectedRows] = useState([]);
    const [validationResults, setValidationResults] = useState({});
    const [validatingNode, setValidatingNode] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [bmcFormVisible, setBmcFormVisible] = useState(false);
    const [currentNode, setCurrentNode] = useState(null);
    const [bmcDetails, setBmcDetails] = useState({ ip: '', username: '', password: '' });
    const [scanResults, setScanResults] = useState([]);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [validationData, setValidationData] = useState(null); // State for validation data

    const itemsPerPage = 4;
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedNodes } = location.state || { selectedNodes: [] };

    useEffect(() => {
        fetchScanResults();
        fetchValidationData(); // Fetch validation data when component mounts
    }, []);

    const fetchScanResults = async () => {
        try {
            const response = await axios.get('http://192.168.249.101:8000/scan');
            setScanResults(response.data);
        } catch (error) {
            console.error('Error fetching scan results:', error);
        }
    };

    const fetchValidationData = async () => {
        try {
            const response = await fetch('/hardware_summary.json'); // Fetching the file from the public directory
            const data = await response.json();
            setValidationData(data); // Set the fetched data to state
        } catch (error) {
            console.error('Error fetching hardware summary:', error);
        }
    };


    const validateNode = (node) => {
        setValidatingNode(node);
        setCurrentNode(node);
        setBmcDetails({ ...bmcDetails, ip: node.ip });
        setBmcFormVisible(true);
    };

    const handleBack = () => {
        navigate(-1);
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
    };

    const handleCheckboxChange = (event, node) => {
        const isChecked = event.target.checked;
        if (isChecked) {
            setSelectedRows([...selectedRows, node]);
        } else {
            setSelectedRows(selectedRows.filter(selectedRow => selectedRow.ip !== node.ip));
        }
    };

    // const handleDeploy = () => {
    //     navigate('/designatednode', { state: { selectedNodes: selectedRows } });
    //     window.scrollTo({ top: 0, behavior: 'smooth' });
    // };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

const handleBmcFormSubmit = async (event) => {
    event.preventDefault();

    try {
        // Submit BMC details to the server
        const response = await axios.post('http://192.168.249.101:8000/set_pxe_boot', bmcDetails);
        console.log('BMC Details submitted:', bmcDetails);
        console.log('Server response:', response.data); // Log the server response for debugging

        // Introduce a delay after sending the PXE boot request
        await new Promise((resolve) => setTimeout(resolve, 120000)); // 1-minute delay (60,000 milliseconds)

        // Fetch validation data after the delay
        const validationDataResponse = await fetch('/hardware_summary.json'); // Fetching the file from the public directory
        if (!validationDataResponse.ok) {
            throw new Error('Failed to fetch validation data');
        }
        
        const fetchedValidationData = await validationDataResponse.json();
        console.log('Fetched validation data:', fetchedValidationData); // Log fetched data for debugging

        // Comparison logic using the fetched data
        const comparisonResults = compareSpecs(fetchedValidationData, requirementData);

        // Determine overall status
        const overallStatus =
            comparisonResults.cpuCoresPassed &&
            comparisonResults.memoryPassed &&
            comparisonResults.diskPassed &&
            comparisonResults.nicPassed ? 'Passed' : 'Failed';

        // Store results in validationResults
        setValidationResults(prevResults => ({
            ...prevResults,
            [currentNode.ip]: {
                status: overallStatus,
                cpuCoresPassed: comparisonResults.cpuCoresPassed,
                memoryPassed: comparisonResults.memoryPassed,
                diskPassed: comparisonResults.diskPassed,
                nicPassed: comparisonResults.nicPassed,
            }
        }));

        // Show success message after all operations
        Swal.fire({
            title: 'Success',
            text: 'Validation completed successfully!',
            confirmButtonText: 'OK',
            confirmButtonColor: '#28a745',
        });

        setBmcFormVisible(false);
        setFormSubmitted(true);
    } catch (error) {
        console.error('Error setting PXE boot:', error);

        // Show error message if any operation fails
        Swal.fire({
            title: 'Failed',
            text: 'Failed to set PXE boot or fetch validation data. Please try again.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#dc3545'
        });

        setBmcFormVisible(false);
        setFormSubmitted(true);
    }
}; 

    const handleCancel = () => {
        setBmcFormVisible(false);
        setValidatingNode(null);
    };
    const handleInfoButtonClick = () => {
        // Check if the validation results exist for the current node
        if (!validationResults || !currentNode || !validationResults[currentNode.ip]) {
            Swal.fire({
                title: 'Error',
                text: 'Validation not done or BMC details are incorrect. Please check and try again.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#dc3545'
            });
            return;
        }

        // Get the current validation result for the node
        const result = validationResults[currentNode.ip];

        // Fetch min requirements and result values
        const minCpuCores = requirementData.cpu_cores;
        const minMemory = parseInt(requirementData.memory);
        const minDiskCount = requirementData.disk_count; // Ensure this is a number
        const minNic1GCount = requirementData.nic_1g_count; // Ensure this is a number

        // Parse validation values
        const validationCpuCores = parseInt(validationData.cpu_cores);
        const validationMemory = parseInt(validationData.memory);
        const validationDiskCount = parseInt(validationData.disk_count); // Convert to number
        const validationNic1GCount = parseInt(validationData.nic_1g_count); // Convert to number

        // Determine heading color based on status
        const headingColor = result.cpuCoresPassed && result.memoryPassed && result.diskPassed && result.nicPassed ? "#28a745" : "#dc3545";

        // Create HTML message with Min Req Value and Result Value
        const msg = `
        <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 20px; color: ${headingColor};">
            TEST RESULT: ${result.cpuCoresPassed && result.memoryPassed && result.diskPassed && result.nicPassed ? "PASSED" : "FAILED"}
        </h1>
        <div style="cursor: pointer; font-size: 1.1rem; color: #007bff; margin-bottom: 10px;" id="toggleReport">
            Detailed Report <span id="arrow" style="font-size: 1.1rem;">▼</span>
        </div>
        <div id="reportWrapper" style="max-height: 0; overflow: hidden; transition: max-height 0.3s ease;">
            <table style="width:100%; border-collapse: collapse; margin-top: 10px; border-radius: 10px; overflow: hidden;">
                <thead style="background-color: #f8f9fa;">
                    <tr>
                        <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left; font-size: 1rem;">PARAMETER</th>
                        <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left; font-size: 1rem;">Min Req Value</th>
                        <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left; font-size: 1rem;">Result Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">CPU Cores</td>
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">${minCpuCores}</td>
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">${validationCpuCores}</td>
                    </tr>
                    <tr style="background-color: #f8f9fa;">
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">RAM</td>
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">${minMemory} GB</td>
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">${validationMemory} GB</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">Disk Count</td>
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">${minDiskCount}</td>
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">${validationDiskCount}</td>
                    </tr>
                    <tr style="background-color: #f8f9fa;">
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">NIC Count</td>
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">${minNic1GCount}</td>
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">${validationNic1GCount}</td>
                    </tr>
                </tbody>
            </table>
        </div>`;

        // Display the Swal modal
        Swal.fire({
            confirmButtonText: 'OK',
            confirmButtonColor: '#17a2b8',
            html: msg,
            didRender: () => {
                const toggleButton = document.getElementById('toggleReport');
                const reportWrapper = document.getElementById('reportWrapper');
                const arrow = document.getElementById('arrow');

                toggleButton.addEventListener('click', () => {
                    if (reportWrapper.style.maxHeight === '0px') {
                        reportWrapper.style.maxHeight = reportWrapper.scrollHeight + 'px';
                        arrow.textContent = '▲';  // Change arrow to up arrow
                    } else {
                        reportWrapper.style.maxHeight = '0px';
                        arrow.textContent = '▼';  // Change arrow to down arrow
                    }
                });
            }
        });
    };

    const compareSpecs = (validationData, requirementData) => {
        const validationMemory = parseInt(validationData.memory.replace(" Gi", ""));
        const validationCpuCores = parseInt(validationData.cpu_cores);
        const validationDiskCount = parseInt(validationData.disk_count);
        const validationNic1GCount = parseInt(validationData.nic_1g_count);

        const minCpuCores = requirementData.cpu_cores;
        const minMemory = parseInt(requirementData.memory.replace(" Gi", ""));
        const minDiskCount = parseInt(requirementData.disk_count);
        const minNic1GCount = requirementData.nic_1g_count;

        return {
            cpuCoresPassed: validationCpuCores >= minCpuCores,
            memoryPassed: validationMemory >= minMemory,
            diskPassed: validationDiskCount >= minDiskCount,
            nicPassed: validationNic1GCount >= minNic1GCount,
        };
    };
    const handleDeployClick = (ip) => {
        Swal.fire({
            title: "Management Network",
            width: "60%",
            html: `
                <div style="display: flex; justify-content: space-between; font-size: 1.2rem; padding: 10px; margin-top: 20px;">
             <div style="display: flex; flex-direction: column; align-items: center;">
        <div style="display: flex; align-items: center;">
            <span style="margin-left: 50px; font-weight: bold;">IP/CIDR</span>
        </div>
        <div style="display: flex; align-items: center; margin-top: 10px;">
            <span style="margin-right: 5px; color: red;">*</span>           
            <span style="margin-right: 10px; font-weight: bold;">OOB&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
            <input type="text" placeholder="Enter IP/CIDR" 
                style="padding: 8px; border-radius: 5px; 
                       border: 1px solid #ccc; width: 120px;">
        </div>
        <div style="display: flex; align-items: center; margin-top: 10px;">
            <span style="margin-right: 5px; color: red;">*</span>           
            <span style="margin-right: 5px; font-weight: bold; margin-left: 0;">Mgmt IP</span>
            <input type="text" placeholder="Enter Mgmt IP" 
                style="padding: 8px; border-radius: 5px; 
                       border: 1px solid #ccc; width: 120px;">
        </div>
                <div style="display: flex; align-items: center; margin-top: 10px; margin-left: -150px;">
                    <span style="margin-right: 5px; color: red;">*</span>           
                    <span style="margin-right: 5px; font-weight: bold;">VLAN&nbsp;&nbsp;</span>
                </div>
                        <div style="display: flex; align-items: center; margin-top: 10px; margin-left: 40px;">
    <span style="margin-right: 5px; color: red;">*</span>           
    <span style="margin-right: 5px; font-weight: bold; margin-left: 0;">Provider NGW</span>
    <input type="text" placeholder="Enter Gateway" 
           style="padding: 8px; border-radius: 5px; 
                  border: 1px solid #ccc; width: 120px;">
</div>

        <div style="margin-top: 10px;"></div>
    </div>
    <div style="display: flex; flex-direction: column; align-items: center;">
        <span style="font-weight: bold;">VLAN ID</span>
        <input type="text" placeholder="Enter VLAN ID" 
            style="margin-top: 10px; padding: 8px; border-radius: 5px; 
                   border: 1px solid #ccc; width: 120px;">
    </div>
    <div style="display: flex; flex-direction: column; align-items: center;">
        <span style="font-weight: bold;">BOND</span>
        <input type="checkbox" style="margin-top: 19px; width: 16px; height: 16px;">
    </div>
    <div style="display: flex; flex-direction: column; align-items: center;">
        <span style="font-weight: bold;">INTERFACE</span>
        <div style="margin-top: 10px; ">
            <select style="padding: 8px; border-radius: 5px; 
                           border: 1px solid #ccc; width: 120px; font-size: 0.8rem; height: 32px">
                <option value="" disabled selected>Select</option>
                <option value="eth0">eth0</option>
                <option value="eth1">eth1</option>
                <option value="wlan0">wlan0</option>
                <option value="lo">(lo)</option>
                <option value="docker0">docker0</option>
            </select>
        </div>
        <div style="margin-top: 10px;">
            <select style="padding: 8px; border-radius: 5px; 
                           border: 1px solid #ccc; width: 120px; font-size: 0.8rem; height: 31.5px">
                <option value="" disabled selected>Select</option>
                <option value="eth0">eth0</option>
                <option value="eth1">eth1</option>
                <option value="wlan0">wlan0</option>
                <option value="lo">(lo)</option>
                <option value="docker0">docker0</option>
            </select>
        </div>
        <div style="margin-top: 10px;">
            <select style="padding: 8px; border-radius: 5px; 
                           border: 1px solid #ccc; width: 120px; font-size: 0.8rem; height: 32px">
                <option value="" disabled selected>Select</option>
                <option value="eth0">eth0</option>
                <option value="eth1">eth1</option>
                <option value="wlan0">wlan0</option>
                <option value="lo">(lo)</option>
                <option value="docker0">docker0</option>
            </select>
        </div>
             </div>
                </div>
            `,
            confirmButtonText: "BOOT",
            confirmButtonColor: "#28a745",
        }).then((result) => {
            if (result.isConfirmed) {
                // Trigger the next popup after clicking "BOOT"
                Swal.fire({
                    title: "Deployment",
                    width: "60%",
                    html: `
                        <div style="display: flex; justify-content: space-between; font-size: 1.2rem; padding: 10px; margin-top: 20px;">
             <div style="display: flex; flex-direction: column; align-items: center;">
        <div style="display: flex; align-items: center;">
            <span style="margin-left: 50px; font-weight: bold;">IP/CIDR</span>
        </div>
        <div style="display: flex; align-items: center; margin-top: 10px;">
            <span style="margin-right: 5px; color: red;">*</span>           
            <span style="margin-right: 10px; font-weight: bold;">IBN &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
            <input type="text" placeholder="Enter IP/CIDR" 
                style="padding: 8px; border-radius: 5px; 
                       border: 1px solid #ccc; width: 120px;">
        </div>
        <div style="display: flex; align-items: center; margin-top: 10px;">
            <span style="margin-right: 5px; color: red;">*</span>           
            <span style="margin-right: 5px; font-weight: bold; margin-left: 0;">Storage</span>
            <input type="text" placeholder="Enter IP" 
                style="padding: 8px; border-radius: 5px; 
                       border: 1px solid #ccc; width: 120px;">
        </div>
                <div style="display: flex; align-items: center; margin-top: 10px; margin-left: 0px;">
                    <span style="margin-right: 5px; color: red;">*</span>           
                    <span style="margin-right: 5px; font-weight: bold;">VIP&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                        <input type="text" placeholder="Enter" 
           style="padding: 8px; border-radius: 5px; 
                  border: 1px solid #ccc; width: 120px;">
                </div>
                        <div style="display: flex; align-items: center; margin-top: 10px; margin-left: -12px;">
    <span style="margin-right: 5px; color: red;">*</span>           
    <span style="margin-right: 5px; font-weight: bold; margin-left: 0;">Services</span>
<select style="padding: 8px; border-radius: 5px; 
                           border: 1px solid #ccc; width: 120px; font-size: 0.8rem; height: 31.5px">
                <option value="" disabled selected>Select</option>
                <option value="eth0">docker</option>
                <option value="eth1">kubernetes</option>
                <option value="wlan0">..</option>
                <option value="lo">..</option>
                <option value="docker0">..</option>
            </select>
</div>

        <div style="margin-top: 10px;"></div>
    </div>
    <div style="display: flex; flex-direction: column; align-items: center;">
        <span style="font-weight: bold;">VLAN ID</span>
        <input type="text" placeholder="Enter VLAN ID" 
            style="margin-top: 10px; padding: 8px; border-radius: 5px; 
                   border: 1px solid #ccc; width: 120px;">
    <input type="text" placeholder="Enter VLAN ID" 
        style="margin-top: 10px; padding: 8px; border-radius: 5px; 
               border: 1px solid #ccc; width: 120px;">
    </div>
    <div style="display: flex; flex-direction: column; align-items: center;">
        <span style="font-weight: bold;">BOND</span>
        <input type="checkbox" style="margin-top: 19px; width: 16px; height: 16px;">
        <input type="checkbox" style="margin-top: 19px; width: 16px; height: 16px;">
    </div>
    <div style="display: flex; flex-direction: column; align-items: center;">
        <span style="font-weight: bold;">INTERFACE</span>
        <div style="margin-top: 10px; ">
            <select style="padding: 8px; border-radius: 5px; 
                           border: 1px solid #ccc; width: 120px; font-size: 0.8rem; height: 32px">
                <option value="" disabled selected>Select</option>
                <option value="eth0">eth0</option>
                <option value="eth1">eth1</option>
                <option value="wlan0">wlan0</option>
                <option value="lo">(lo)</option>
                <option value="docker0">docker0</option>
            </select>
        </div>
        <div style="margin-top: 10px;">
            <select style="padding: 8px; border-radius: 5px; 
                           border: 1px solid #ccc; width: 120px; font-size: 0.8rem; height: 31.5px">
                <option value="" disabled selected>Select</option>
                <option value="eth0">eth0</option>
                <option value="eth1">eth1</option>
                <option value="wlan0">wlan0</option>
                <option value="lo">(lo)</option>
                <option value="docker0">docker0</option>
            </select>
        </div>
             </div>
                </div>
                    `,
                    confirmButtonText: "DEPLOY",
                    confirmButtonColor: "#28a745",
                });
            }
        });
    };

    const paginatedNodes = selectedNodes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div>
            <div className={styles.header}>
                <button className={styles["back-button"]} onClick={handleBack}>
                    <FontAwesomeIcon icon={faArrowLeft} size="2x" />
                </button>
                <center>
                    <h1>Validation</h1>
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
                                        <th>Status</th>
                                        <th>Result</th>
                                        <th>DEPLOY</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedNodes.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className={styles["no-device-message"]}><center>No devices selected</center></td>
                                        </tr>
                                    ) : (
                                        paginatedNodes.map((node, index) => (
                                            <tr key={node.ip}>
                                                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                <td>{node.ip}</td>
                                                <td>
                                                    <button
                                                        disabled={validatingNode !== null && validatingNode.ip === node.ip}
                                                        onClick={() => validateNode(node)}
                                                    >
                                                        {validatingNode !== null && validatingNode.ip === node.ip ? 'Validated' : 'Validate'}
                                                    </button>
                                                </td>
                                                <td style={{ color: 'red', fontFamily: 'Arial, sans-serif' }}>
                                                    {validationResults[node.ip] ? validationResults[node.ip].status : 'Not validated'}
                                                </td>
                                                <td>
                                                    {(validationResults[node.ip] || formSubmitted) ? (
                                                        <button
                                                            onClick={handleInfoButtonClick}
                                                            style={{
                                                                backgroundColor: validationResults[node.ip]?.status === 'Passed' ? '#28a745' : '#dc3545', // Green for 'Passed', Red for 'Failed'
                                                                color: 'white', // Text color to make it readable
                                                                cursor: 'pointer', // To indicate the button is clickable
                                                                border: 'none', // Optional: remove default border
                                                                padding: '8px 12px', // Optional: for better button padding
                                                                borderRadius: '4px' // Optional: to make the button corners rounded
                                                            }}
                                                        >
                                                            Info
                                                        </button>
                                                    ) : null}
                                                </td>
                                                <td className={styles["deploy-column"]}>
                                                    {validationResults[node.ip] && (
                                                        <button
                                                            className={styles["deploy-button"]}
                                                            disabled={
                                                                validationResults[node.ip].status !== "Passed"
                                                            } // Disable if not 'Passed'
                                                            title={
                                                                validationResults[node.ip].status !== "Passed"
                                                                    ? "Sorry, you can't deploy!"
                                                                    : undefined
                                                            } // Tooltip message when hovered
                                                            style={{
                                                                backgroundColor:
                                                                    validationResults[node.ip].status === "Passed"
                                                                        ? "#28a745"
                                                                        : "#dc3545", // Green for Passed, red for Failed
                                                                color: "white",
                                                                cursor:
                                                                    validationResults[node.ip].status === "Passed"
                                                                        ? "pointer"
                                                                        : "not-allowed",
                                                            }}
                                                            onClick={() => handleDeployClick(node.ip)} // Call handleDeployClick on button click
                                                        >
                                                            Deploy
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>

                            <div className={styles.pagination}>
                                {Array.from({ length: Math.ceil(selectedNodes.length / itemsPerPage) }, (_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handlePageChange(i + 1)}
                                        className={styles[currentPage === i + 1 ? 'active' : '']}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            {/* <button
                                className="next-button"
                                onClick={handleDeploy}
                                disabled={selectedRows.length === 0}
                            >
                                <strong>Next</strong>
                            </button> */}
                        </div>
                        <Sidebar />
                    </div>
                </div>
            </div>

            {/* BMC Form */}
            <div className={`${styles["bmc-form"]} ${bmcFormVisible ? styles.visible : ''}`}>
                <h2><strong>Enter BMC Details for {currentNode?.ip}</strong></h2>
                <form onSubmit={handleBmcFormSubmit}>
                    <label>
                        BMC IP Address:
                        <input
                            type="text"
                            value={bmcDetails.ip}
                            onChange={(e) =>
                                setBmcDetails({ ...bmcDetails, ip: e.target.value })
                            }
                            required
                        />
                    </label>
                    <label>
                        BMC Username:
                        <input
                            type="text"
                            value={bmcDetails.username}
                            onChange={(e) =>
                                setBmcDetails({ ...bmcDetails, username: e.target.value })
                            }
                            required
                        />
                    </label>
                    <label>
                        BMC Password:
                        <input
                            type="password"
                            value={bmcDetails.password}
                            onChange={(e) =>
                                setBmcDetails({ ...bmcDetails, password: e.target.value })
                            }
                            required
                        />
                    </label>
                    <div>
                        <button type="submit">Submit</button>
                        <button type="button" className={styles["cancel-button"]} onClick={handleCancel}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Validation;


