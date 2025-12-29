import React from 'react'

export default function Templates() {
    return (
        <div>

            <div>
                <div class="modal fade" id="exampleModalCenter-view" tabindex="-1" aria-labelledby="exampleModalCenterTitle" style={{ display: 'none' }} aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="exampleModalCenterTitle">whatsapptest</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
                                </button>
                            </div>
                            <div class="modal-body">
                                <div class="card-body">
                                    <div class="d-flex flex-column justify-content-between">
                                        <h6 class="mb-1 fw-500">application</h6>
                                        <p class="mb-1">text of the printing and text of the printing and</p>
                                        <p class="mb-1">test.com</p>
                                    </div>
                                    <hr />
                                    <div class="d-flex flex-column justify-content-between align-items-center">
                                        <div class="d-flex align-items-center">
                                            <i class="fa fa-reply me-2" aria-hidden="true"></i>
                                            <span>welcome to sales 2</span>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal fade" id="exampleModalCenter-create" tabindex="-1" aria-labelledby="exampleModalCenterTitle" style={{ display: 'none' }} aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="exampleModalCenterTitle">Create Template</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <form>
                                        <div class="form-group">
                                            <label class="form-label mb-2" for="t_name">Template Name<span class="text-danger ">* </span></label>
                                            <input type="text" class="form-control" id=" " placeholder="Enter template name" />
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label mb-2" for="t_name">Template Category<span class="text-danger ">*</span></label>
                                            <select class="form-select" id="exampleFormControlSelect1">
                                                <option selected="" disabled="">Select Category</option>
                                                <option value="" selected="">Select Category</option>
                                                <option value="MARKETING">Marketing</option>
                                                <option value="UTILITY">Utility</option>
                                                <option value="MARKETING">Marketing</option>
                                                <option value="AUTHENTICATION">Authentication</option>
                                            </select>
                                        </div>
                                        <div class="form-group">
                                            <label for="Subject" class="form-label">Subject</label>
                                            <textarea name="address" class="form-control" id="address" rows="5" required="required" data-qb-tmp-id="lt-904363" spellcheck="false" data-gramm="false"></textarea>
                                        </div>
                                    </form>
                                </div>
                                <div class="col-md-6">

                                    <div class="card h-100 border-dashed">
                                        <div class="card-header">
                                            <div class="header-title">
                                                <h5 class="card-title">Preview</h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModalCenter3" >Create</button>
                            <button type="button" class="btn btn-warning">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="position-relative">
            </div>
            <div id="content-page" class="content-page">
                <div class="container">
                    <div class="row w-100 mb-4 mt-5">
                        <div class="d-flex align-items-center justify-content-between flex-wrap">
                            <h4 class="fw-bold text-primary">Telegram- Broadcast  Templates</h4>
                            <div class="d-flex align-items-center">

                                <button type="button" class="btn btn-primary ms-2 d-flex align-items-center" data-bs-toggle="modal" data-bs-target="#exampleModalCenter-create">
                                    <span class="ms-2">Create  </span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-sm-12 col-lg-12">
                            <div class="card">
                                <div class="card-header border-0">
                                    <div class="d-flex align-items-center justify-content-between flex-wrap">
                                        <ul class="nav nav-pills  " id="pills-tab" role="tablist">
                                            <li class="nav-item" role="presentation">
                                                <a class="nav-link active" id="pills-home-tab" data-bs-toggle="pill" href="#pills-home" role="tab" aria-controls="pills-home" aria-selected="true">Message Templates</a>
                                            </li>
                                            <li class="nav-item" role="presentation">
                                                <a class="nav-link" id="pills-profile-tab" data-bs-toggle="pill" href="#pills-profile" role="tab" aria-controls="pills-profile" aria-selected="false" tabindex="-1">Announcement</a>
                                            </li>
                                            <li class="nav-item" role="presentation">
                                                <a class="nav-link" id="pills-contact-tab" data-bs-toggle="pill" href="#pills-contact" role="tab" aria-controls="pills-contact" aria-selected="false" tabindex="-1">Survey and Poll</a>
                                            </li>
                                            <li class="nav-item" role="presentation">
                                                <a class="nav-link" id="pills-forms-tab" data-bs-toggle="pill" href="#pills-forms" role="tab" aria-controls="pills-Forms" aria-selected="false" tabindex="-1">Forms</a>
                                            </li>
                                            <li class="nav-item" role="presentation">
                                                <a class="nav-link" id="pills-content-tab" data-bs-toggle="pill" href="#pills-content" role="tab" aria-controls="pills-Content" aria-selected="false" tabindex="-1">Content</a>
                                            </li>
                                            <li class="nav-item" role="presentation">
                                                <a class="nav-link" id="pills-event-tab" data-bs-toggle="pill" href="#pills-event" role="tab" aria-controls="pills-contact" aria-selected="false" tabindex="-1">Event</a>
                                            </li>
                                        </ul>

                                    </div>
                                </div>
                                <div class="card-body">
                                    <div class="tab-content" id="pills-tabContent-2">
                                        <div class="tab-pane fade active show" id="pills-home" role="tabpanel" aria-labelledby="pills-home-tab">

                                            <div class="table-responsive">
                                                <div class="d-flex align-items-center justify-content-between flex-wrap mb-4">
                                                    <h4 class="fw-bold text-primary"> Templates List</h4>
                                                    <div class="d-flex align-items-center">
                                                        <input type="text" class="text search-input form-control bg-soft-primary  " placeholder="Search..." />
                                                    </div>
                                                </div>
                                                <table class="table table-bordered table-hover table-striped">
                                                    <thead class=" bg-light text-nowrap">
                                                        <tr>
                                                            <th scope="col">Template Name</th>
                                                            <th scope="col">Template Type</th>
                                                            <th scope="col">Subject</th>
                                                            <th scope="col">Status</th>
                                                            <th scope="col">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>


                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </td>
                                                        </tr>

                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        <div class="tab-pane fade" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab">
                                            <div class="table-responsive">
                                                <div class="d-flex align-items-center justify-content-between flex-wrap mb-4">
                                                    <h4 class="fw-bold text-primary"> Announcement</h4>
                                                    <div class="d-flex align-items-center">
                                                        <input type="text" class="text search-input form-control bg-soft-primary  " placeholder="Search..." />
                                                    </div>
                                                </div>
                                                <table class="table table-bordered table-hover table-striped">
                                                    <thead class=" bg-light text-nowrap">
                                                        <tr>
                                                            <th scope="col">Template Name</th>
                                                            <th scope="col">Template Type</th>
                                                            <th scope="col">Subject</th>
                                                            <th scope="col">Status</th>
                                                            <th scope="col">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </td>
                                                        </tr>

                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        <div class="tab-pane fade" id="pills-contact" role="tabpanel" aria-labelledby="pills-contact-tab">
                                            <div class="table-responsive">
                                                <div class="d-flex align-items-center justify-content-between flex-wrap mb-4">
                                                    <h4 class="fw-bold text-primary">Survey and Poll</h4>
                                                    <div class="d-flex align-items-center">
                                                        <input type="text" class="text search-input form-control bg-soft-primary  " placeholder="Search..." />
                                                    </div>
                                                </div>
                                                <table class="table table-bordered table-hover table-striped">
                                                    <thead class=" bg-light text-nowrap">
                                                        <tr>
                                                            <th scope="col">Template Name</th>
                                                            <th scope="col">Template Type</th>
                                                            <th scope="col">Subject</th>
                                                            <th scope="col">Status</th>
                                                            <th scope="col">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>

                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        <div class="tab-pane fade" id="pills-forms" role="tabpanel" aria-labelledby="pills-forms-tab">
                                            <div class="table-responsive">
                                                <div class="d-flex align-items-center justify-content-between flex-wrap mb-4">
                                                    <h4 class="fw-bold text-primary">Forms</h4>
                                                    <div class="d-flex align-items-center">
                                                        <input type="text" class="text search-input form-control bg-soft-primary  " placeholder="Search..." />
                                                    </div>
                                                </div>
                                                <table class="table table-bordered table-hover table-striped">
                                                    <thead class=" bg-light text-nowrap">
                                                        <tr>
                                                            <th scope="col">Template Name  </th>
                                                            <th scope="col">Template Type</th>
                                                            <th scope="col">Subject</th>
                                                            <th scope="col">Status</th>
                                                            <th scope="col">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>

                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        <div class="tab-pane fade" id="pills-content" role="tabpanel" aria-labelledby="pills-content-tab">
                                            <div class="table-responsive">
                                                <div class="d-flex align-items-center justify-content-between flex-wrap mb-4">
                                                    <h4 class="fw-bold text-primary">Content</h4>
                                                    <div class="d-flex align-items-center">
                                                        <input type="text" class="text search-input form-control bg-soft-primary  " placeholder="Search..." />
                                                    </div>
                                                </div>
                                                <table class="table table-bordered table-hover table-striped">
                                                    <thead class=" bg-light text-nowrap">
                                                        <tr>
                                                            <th scope="col">Template Name  </th>
                                                            <th scope="col">Template Type</th>
                                                            <th scope="col">Subject</th>
                                                            <th scope="col">Status</th>
                                                            <th scope="col">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </td>
                                                        </tr>

                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        <div class="tab-pane fade" id="pills-event" role="tabpanel" aria-labelledby="pills-events-tab">
                                            <div class="table-responsive">
                                                <div class="d-flex align-items-center justify-content-between flex-wrap mb-4">
                                                    <h4 class="fw-bold text-primary">Event</h4>
                                                    <div class="d-flex align-items-center">
                                                        <input type="text" class="text search-input form-control bg-soft-primary  " placeholder="Search..." />
                                                    </div>
                                                </div>
                                                <table class="table table-bordered table-hover table-striped">
                                                    <thead class=" bg-light text-nowrap">
                                                        <tr>
                                                            <th scope="col">Template Name   </th>
                                                            <th scope="col">Template Type</th>
                                                            <th scope="col">Subject</th>
                                                            <th scope="col">Status</th>
                                                            <th scope="col">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Desktop Application</th>
                                                            <td>Announcement</td>
                                                            <td>Announcing: Vitel Global Windows desktop application is now available on the Microsoft Store</td>
                                                            <td><span class="badge bg-success border-radius  rounded-pill ">Approved</span></td>
                                                            <td>
                                                                <div class="card-header-toolbar d-flex align-items-center">

                                                                    <div class="dropdown">
                                                                        <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span class="material-symbols-outlined">
                                                                                more_vert
                                                                            </span>
                                                                        </div>
                                                                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                visibility
                                                                            </span>View</a>

                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                edit
                                                                            </span>Edit</a>
                                                                            <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                                delete
                                                                            </span>Delete</a>

                                                                        </div>
                                                                    </div>
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
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal fade" id="exampleModalCenter3" tabindex="-1" aria-labelledby="exampleModalCenterTitle" style={{ display: 'none' }} aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-md" role="document">
                    <div class="modal-content">

                        <div class="modal-body text-center">
                            <img src="assets/images/successfull.png" class="mt-3" />
                            <h4 class="mt-3">New Broadcast has been scheduled successfully</h4>
                        </div>
                        <div class="modal-footer justify-content-center border-0">
                            <button type="button" class="btn btn-primary px-5" data-bs-dismiss="modal" aria-label="Close">OK</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}
