import React, { useEffect, useState } from 'react';
import './CreateShipment.css';
import { Link, useNavigate } from 'react-router-dom';
import useAxiosPrivate from '../../../../hooks/useAxiosPrivate';
import useAuth from '../../../../hooks/useAuth';
import { useForm } from 'react-hook-form';
import DropDown from '../../../../components/DropDown';
import ErrorModal from '../../../../components/ErrorModal';
import close from '../../../../assets/Logo/actions/cross.svg';

export default function Create() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();
  const [outgoingBatches, setOutgoingBatches] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [outgoingBatch_id, setOutgoingBatch_id] = useState();
  const [customer_id, setCustomer_id] = useState();
  const [totalTotalQuantity, setTotalQuantity] = useState();
  const { err, setErr } = useState({});
  const { setLoading } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const getOutgoingBatches = async () => {
      try {
        const res = await axiosPrivate.get('/outgoing-batches', {
          signal: controller.signal,
        });
        if (res.status === 200) {
          setOutgoingBatches(res?.data?.data);
        }
      } catch (err) {
        <ErrorModal />;
      }
    };

    const customers = async () => {
      try {
        const res = await axiosPrivate.get('/customers', {
          signal: controller.signal,
        });
        if (res.status === 200) {
          setCustomers(res?.data?.data);
        }
      } catch (err) {
        <ErrorModal />;
      }
    };
    getOutgoingBatches();
    customers();
    return () => {
      controller.abort();
    };
  }, []);

  const handleDropDown = (outgoingBatch) => {
    setOutgoingBatch_id(outgoingBatch?.id);
    setTotalQuantity(outgoingBatch?.total_quantity);
  };

  const handleCustomerDropDown = (customer) => {
    setCustomer_id(customer?.id);
  };

  const handleAddShipment = async (data, e) => {
    data.outgoing_batch_id = outgoingBatch_id;
    data.customer_id = customer_id;
    const controller = new AbortController();
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosPrivate.post('/shipment', data, {
        signal: controller.signal,
      });

      if (res.status === 200) {
        setLoading(false);
        controller.abort();
        navigate('/dashboard/shipments');
      }
    } catch (err) {
      setLoading(false);
      setErr(err.response.data.errors);
    }
  };

  const handleUnique = async (nameProperty, value) => {
    const controller = new AbortController();
    const data = {
      property: nameProperty,
      data: {
        [nameProperty]: value,
      },
    };

    try {
      const res = await axiosPrivate.post('/unique-shipment-batch', data, {
        signal: controller.signal,
      });
      if (res.status === 200) {
        controller.abort();
        setError(nameProperty, {});
      }
    } catch (err) {
      setError(nameProperty, {
        type: 'manual',
        message: `The ${nameProperty} is not unique`,
      });
      controller.abort();
    }
  };

  return (
    <div>
      <div>
        <Link to="/dashboard/shipments" className="d-flex flex-column">
          <img
            className="align-self-end page-close create-page-close-position"
            src={close}
            alt=""
          />
        </Link>
        <h1 className="text-center my-46 create-header">Create a Shipment</h1>
        <form onSubmit={handleSubmit(handleAddShipment)}>
          <div className="row p-5 create-data-container create-data-info">
            <div className="col-md-6 py-3 px-80">
              <label
                htmlFor="shipment-name"
                className="form-label fw-bold text-warning"
              >
                Shipment Name
              </label>
              <input
                type="text"
                className="form-control"
                {...register('name', {
                  required: 'Name is Required',
                })}
                onBlur={(e) => handleUnique('name', e.target.value)}
                id="shipment-name"
                placeholder="Name"
              />
              {errors.name && (
                <p className="text-danger">{errors.name.message}</p>
              )}
              {err && <p className="text-danger">{err?.name[0]}</p>}
            </div>

            <div className="col-md-6 py-3 px-80">
              <label
                htmlFor="shipment-date"
                className="form-label fw-bold text-warning"
              >
                Shipment Date
              </label>
              <input
                type="date"
                {...register('shipment_date', {
                  required: 'Shipment Date is Required',
                })}
                defaultValue={new Date().toISOString().substr(0, 10)}
                className="form-control"
                id="shipment-date"
                placeholder="Shipment Date"
              />
              {errors.shipment_date && (
                <p className="text-danger">{errors.shipment_date.message}</p>
              )}
              {err && <p className="text-danger">{err?.shipment_date}</p>}
            </div>

            <div className="col-md-6 py-3 px-80">
              <label
                htmlFor="outgoing-batch"
                className="form-label fw-bold text-warning"
              >
                Outgoing Batch
              </label>
              <DropDown
                handleDropDown={handleDropDown}
                dropDownValue={outgoingBatches}
                optionLabel="outgoing_batch_code"
              />
            </div>
            {outgoingBatch_id && (
              <div className="col-md-6 py-3 px-80">
                <label
                  htmlFor="quantity"
                  className="form-label fw-bold text-warning"
                >
                  Quantity
                </label>
                <input
                  type="number"
                  step="1"
                  min={1}
                  className="form-control"
                  {...register('quantity', {
                    required: 'Quantity is Required',
                    validate: {
                      positive: (value) =>
                        parseFloat(value) > 0 || 'Quantity must be positive',
                      max: (value) =>
                        parseFloat(value) <= totalTotalQuantity ||
                        `Quantity must be less than or equal to ${totalTotalQuantity}`,
                      integer: (value) =>
                        Number.isInteger(parseFloat(value)) ||
                        'Quantity must be an integer',
                    },
                  })}
                  id="quantity"
                  placeholder="Quantity"
                />
                {errors.quantity && (
                  <p className="text-danger">{errors.quantity.message}</p>
                )}
                {err && <p className="text-danger">{err?.quantity[0]}</p>}
              </div>
            )}

            <div className="col-md-6 py-3 px-80">
              <label
                htmlFor="customer"
                className="form-label fw-bold text-warning"
              >
                Customer
              </label>
              <DropDown
                handleDropDown={handleCustomerDropDown}
                dropDownValue={customers}
              />
            </div>
            {customer_id && outgoingBatch_id && (
              <div className="col-md-12 p-3">
                <button
                  type="submit"
                  disabled={errors?.name?.message}
                  className="btn btn-orange float-end create-create-btn"
                >
                  Create
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
