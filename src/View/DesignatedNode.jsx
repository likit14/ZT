import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../Components/sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import styles from "../Styles/DesignatedNode.module.css"; // Import CSS Modules

const DesignatedNode = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState(
    location.state.selectedNodes || []
  );
  const [roles, setRoles] = useState(
    selectedRows.map((node, index) => ({
      id: index + 1,
      slNo: index + 1,
      ipAddress: node.ip,
      hostname: node.ip,
      roles: [],
    }))
  );

  const [bmcFormVisible, setBmcFormVisible] = useState(false);
  const [currentNode, setCurrentNode] = useState(null);
  const [bmcDetails, setBmcDetails] = useState({
    ip: "",
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [deploymentCompleted, setDeploymentCompleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 4; // Change this to 4 rows per page

  const handleCheckboxChange = (event, row, role) => {
    const isChecked = event.target.checked;
    const updatedRoles = roles.map((item) => {
      if (item.id === row.id) {
        const rolesSet = new Set(item.roles);
        if (isChecked) {
          rolesSet.add(role);
        } else {
          rolesSet.delete(role);
        }
        return { ...item, roles: Array.from(rolesSet) };
      }
      return item;
    });
    setRoles(updatedRoles);

    const updatedSelectedRows = isChecked
      ? [...selectedRows, row]
      : selectedRows.filter((selectedRow) => selectedRow.id !== row.id);
    setSelectedRows(updatedSelectedRows);
  };

  const handleDeploy = (node) => {
    setCurrentNode(node);
    setBmcFormVisible(true);
  };

  const handleBack = () => {
    navigate(-1); // Navigate to the previous page in history
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100); // Delay to ensure navigation completes before scrolling
  };

  const handleBmcFormSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/set_pxe_boot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...bmcDetails, role: currentNode.roles[0] }), // Assuming only one role is selected
      });

      const result = await response.json();
      console.log(result);

      setDeploymentCompleted(true);

      setBmcDetails({
        ip: "",
        username: "",
        password: "",
      });

      setBmcFormVisible(false);
      navigate("/deploymentinfo");
    } catch (error) {
      console.error("Deployment error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setBmcFormVisible(false);
    setLoading(false);
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = roles.slice(indexOfFirstRow, indexOfLastRow);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  return (
    <div>
      <div className={styles.headers1}>
        <button className={styles.backbutton} onClick={handleBack}>
          <FontAwesomeIcon icon={faArrowLeft} size="2x" />
        </button>
        <center>
          <h1>Designated Nodes</h1>
        </center>
      </div>
      <div className={styles.container}>
        <table className={styles["data-table"]}>
          <thead>
            <tr>
              <th>Sl No.</th>
              <th>IP Address</th>
              <th>Roles</th>
              <th>Deploy</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.map((row, index) => (
              <tr key={index}>
                <td>{row.slNo}</td>
                <td>{row.ipAddress}</td>
                <td >
                  <div className={styles["checkbox-column"]}>
                  <label>
                    <input
                      type="checkbox"
                      checked={row.roles.includes("HCI")}
                      onChange={(event) =>
                        handleCheckboxChange(event, row, "HCI")
                      }
                    />
                    <span>HCI</span>
                  </label>
                  <br />
                  <label>
                    <input
                      type="checkbox"
                      checked={row.roles.includes("Compute&Storage")}
                      onChange={(event) =>
                        handleCheckboxChange(event, row, "Compute&Storage")
                      }
                    />
                    <span>Compute&Storage</span>
                  </label>
                  </div>
                </td>
                <td>
                  <button
                    onClick={() => handleDeploy(row)}
                    disabled={row.roles.length === 0}
                  >
                    Deploy
                  </button>
                  {loading && currentNode && currentNode.id === row.id && (
                    <div className={styles.loader}></div>
                  )}
                  {deploymentCompleted &&
                    currentNode &&
                    currentNode.id === row.id && (
                      <div className={styles.completed}>Completed</div>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles['pagination-button']}>
          <button onClick={handlePreviousPage} disabled={currentPage === 1}>
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={indexOfLastRow >= roles.length}
          >
            Next
          </button>
        </div>

        <Sidebar />

        {/* BMC Form */}
        {bmcFormVisible && (
          <div className={styles["bmc-form"]}>
            <h2><strong>Enter BMC Details for {currentNode.hostname}</strong></h2>
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
                <button type="button" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignatedNode;