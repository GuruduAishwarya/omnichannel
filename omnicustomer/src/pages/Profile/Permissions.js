import React, { useState, useEffect } from 'react';

export default function Permissions() {
    const [isLoading, setIsLoading] = useState(true); // State to manage loading state

    useEffect(() => {
        // Simulate loading permissions
        setTimeout(() => {
            setIsLoading(false); // Set loading to false after loading is complete
        }, 2000); // Simulate a 2-second loading time
    }, []);

    return (
        <>
            {isLoading ? (
                <div className="loader-overlay text-white">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <div className="tab-content" id="pills-tabContent-1">
                    <div className="tab-pane fade" id="pills-Permissions-fill" role="tabpanel" aria-labelledby="pills-Permissions-tab-fill">
                        <div className="">
                            <div className="card-body">
                                <div className="table-responsive">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th className="text-center" scope="col"></th>
                                                <th className="text-center" scope="col">View</th>
                                                <th className="text-center" scope="col">Approve</th>
                                                <th className="text-center" scope="col">Edit</th>
                                                <th className="text-center" scope="col">Admin</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <th className="text-center" scope="row">
                                                    <div className="d-flex">
                                                        <div className="user-img img-fluid flex-shrink-0">
                                                            <img src="/assets/images/user/05.jpg" alt="story-img" className="rounded-circle avatar-40" loading="lazy" />
                                                        </div>
                                                        <div className="ms-3">
                                                            <h6>Vitel global</h6>
                                                            <p className="mb-0">Jan 23, 20:21</p>
                                                        </div>
                                                    </div>
                                                </th>
                                                <td className="text-center">
                                                    <div className="form-check">
                                                        <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                                                        <label className="form-check-label" htmlFor="flexCheckDefault"></label>
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <div className="form-check">
                                                        <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                                                        <label className="form-check-label" htmlFor="flexCheckDefault"></label>
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <div className="form-check">
                                                        <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                                                        <label className="form-check-label" htmlFor="flexCheckDefault"></label>
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <div className="form-check">
                                                        <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                                                        <label className="form-check-label" htmlFor="flexCheckDefault"></label>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th className="text-center" scope="row">
                                                    <div className="d-flex">
                                                        <div className="user-img img-fluid flex-shrink-0">
                                                            <img src="/assets/images/user/05.jpg" alt="story-img" className="rounded-circle avatar-40" loading="lazy" />
                                                        </div>
                                                        <div className="ms-3">
                                                            <h6>Vitel global</h6>
                                                            <p className="mb-0">Jan 23, 20:21</p>
                                                        </div>
                                                    </div>
                                                </th>
                                                <td className="text-center">
                                                    <div className="form-check">
                                                        <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                                                        <label className="form-check-label" htmlFor="flexCheckDefault"></label>
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <div className="form-check">
                                                        <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                                                        <label className="form-check-label" htmlFor="flexCheckDefault"></label>
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <div className="form-check">
                                                        <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                                                        <label className="form-check-label" htmlFor="flexCheckDefault"></label>
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <div className="form-check">
                                                        <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                                                        <label className="form-check-label" htmlFor="flexCheckDefault"></label>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}