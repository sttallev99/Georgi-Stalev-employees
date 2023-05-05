import Papa from 'papaparse';
import { useState } from 'react';

import './App.css';

function App() {
  const [tableHeadRow, setTableHeadRow] = useState([]);
  const [values, setValues] = useState([]);

  const modifyResult = (data) => {
    const projectIDMap = new Map();

    const projectIDsArr = [];

    data.forEach(r => projectIDsArr.push(r.ProjectID))

    Array.from(new Set(projectIDsArr)).forEach((currProjectId) => {
      const workTogetherEmployees = data.filter(r => r.ProjectID === currProjectId);
      projectIDMap.set(currProjectId, workTogetherEmployees);
    });

    return projectIDMap;
  }

  const countSum = (dateFrom, dateTo) => {
    // dateFrom = new Date(dateFrom);
    // dateTo = dateTo.toLowerCase() === 'null' ? new Date() : new Date(dateTo);
    let diffTime = dateTo.getTime() - dateFrom.getTime();

    return Math.floor(diffTime / (1000 * 3600 * 24))
  }

  const checkInterval = (emp1, emp2) => {
    let empOneDateFrom = new Date(emp1.DateFrom);
    let empOneDateTo = emp1.DateTo.toLowerCase() === 'null'
      ? new Date()
      : new Date(emp1.DateTo);
    let empTwoDateFrom = new Date(emp2.DateFrom);
    let empTwoDateTo = emp2.DateTo.toLowerCase() === 'null'
    ? new Date()
    : new Date(emp2.DateTo);

    if(empTwoDateFrom > empOneDateFrom && empTwoDateFrom < empOneDateTo) {
      if(empTwoDateTo > empOneDateTo) {
        return countSum(empTwoDateFrom, empOneDateTo);
      } else {
        return countSum(empTwoDateFrom, empTwoDateTo);
      }
    }

    if(empOneDateFrom > empTwoDateFrom && empOneDateFrom < empTwoDateTo) {
      if(empTwoDateTo > empOneDateTo) {
        return countSum(empOneDateFrom, empOneDateTo);
      } else {
        return countSum(empOneDateFrom, empTwoDateTo);
      }
    }
  }

  const createModifyData = (data) => {
    const resultArr = [];
    let row;
    let daysSum = 0;
    for(let i = 0; i < data.length; i++) {
      for(let j = i + 1; j < data.length; j++) {
        let currDaysSum = checkInterval(data[i], data[j]);
        console.log(currDaysSum)
        if(currDaysSum > daysSum) {
          daysSum = currDaysSum;
        }
        if(currDaysSum === undefined ) {
          continue;
        }
        row = { 
          'Employee ID #1': data[i].EmpID,
          'Employee ID #2': data[j].EmpID,
          'Project ID': data[i].ProjectID,
          'Days worked': currDaysSum 
        }
        resultArr.push(row);
      }
    }

    if(resultArr.length >= 2) {
      const sortedArr = resultArr.sort((r1, r2) => (r1['Days worked'] > r2['Days worked']) ? 1 : (r1['Days worked'] < r2['Days worked']) ? -1 : 0);
      return sortedArr.splice(-1);
    } else {
      return resultArr;
    } 
  }

  const changeHandler = (e) => {
    Papa.parse(e.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: function(result) {
        const mappedResult = modifyResult(result.data);
        const rowsArray = []
        const valuesArr = [];

        mappedResult.forEach((value, key) => {
          if(value.length >= 2) {
            const modifyResult = createModifyData(value);
            console.log(modifyResult)
            
            modifyResult.map((d) => {
              rowsArray.push(Object.keys(d));
              valuesArr.push(Object.values(d));
            });
            setTableHeadRow(rowsArray[0]);
            setValues(valuesArr);
          } else {
            return;
          }
        });
      }
    });
  }

  return (
    <div className="App">
      <input
        type='file'
        name='file'
        accept='.csv'
        onChange={changeHandler}
        style={{ display: 'block', margin: '10px auto'}}
      />
      <br />
      <br />
      <table className='data-container'>
        <thead>
          <tr>
            {tableHeadRow.map((rows, index) => {
              return <th key={index}>{rows}</th>;
            })}
          </tr>
        </thead>
        <tbody>
          {values.map((value, index) => {
            return (
              <tr key={index}>
                {value.map((val, i) => {
                  return <td key={i}>{val}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default App;
