import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../Components/sidebar";
import styles from "../Styles/Scaledown.module.css"; // Import CSS Modules

const Scaledown = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Ensure location.state is not null
  const initialSelectedNodes = location.state?.selectedNodes || [];
  
  const [selectedRows, setSelectedRows] = useState(initialSelectedNodes);
  const [roles, setRoles] = useState(
    selectedRows.map((node, index) => ({
      id: index + 1,
      slNo: index + 1,
      ipAddress: node.ip,
      hostname: node.hostname,
      roles: [],
    }))
  );

  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    setHasData(roles.length > 0);
  }, [roles]);

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

  const handleScaledown = () => {
    // Implement the scaledown logic here
    alert('Scaledown action triggered!');
  };

  const handleBack = () => {
    navigate(-1); // Navigate to the previous page in history
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100); // Delay to ensure navigation completes before scrolling
  };

  return (
    <div>
      <div className={styles.headers1}>
        <button className={styles.backbutton} onClick={handleBack}>
          <FontAwesomeIcon icon={faArrowLeft} size="2x" />
        </button>
        <center>
          <h1>Scale Down</h1>
          {!hasData && (
            <p className={styles.notice}>
              If you are not seeing any data here, please finish the deployment and check again.
            </p>
          )}
        </center>
      </div>
      <div className={styles.container}>
        <table className={styles["data-table"]}>
          <thead>
            <tr>
              <th>Sl No.</th>
              <th>IP Address</th>
              <th>Roles</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((row, index) => (
              <tr key={index}>
                <td>{row.slNo}</td>
                <td>{row.ipAddress}</td>
                <td>
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
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.actions}>
          <button onClick={handleScaledown} className={styles.scaledownButton}>
            Scaledown
          </button>
        </div>
        <Sidebar/>
      </div>
    </div>
  );
};

export default Scaledown;
